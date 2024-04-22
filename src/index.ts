import './scss/styles.scss';

import { WebLarekAPI } from './components/WebLarekAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/Events';
import { AppState } from './components/AppData';
import { Page } from './components/Page';
import { CardBasket, CardCatalog, CardPreview } from './components/Card';
import { cloneTemplate, ensureElement } from './utils/utils';
import { settings } from './utils/constants';
import { IProductItem, IOrderForm, IContactsForm } from './types';
import { Modal } from './components/Modal';
import { Basket } from './components/Basket';
import { OrderForm, ContactsForm } from './components/Form';
import { Success } from './components/Success';

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderFormTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsFormTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

//Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderFormTemplate), events);
const contactsForm = new ContactsForm(
	cloneTemplate(contactsFormTemplate),
	events
);

function orderClear() {
	appData.clearBasket();
	page.counter = appData.getCountItems();
	events.off('order:clear', orderClear);
}

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Изменились элементы каталога
events.on('cards:changed', (cards: { catalog: IProductItem[] }) => {
	page.catalog = cards.catalog.map((item) => {
		const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});

		card.setColorCategory(item.category, settings);
		return card.render({
			price: item.price,
			title: item.title,
			image: item.image,
			category: item.category,
		});
	});
});

//Выбор карточки тавара
events.on('card:select', (item: IProductItem) => {
	const card = new CardPreview(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			if (!appData.isIncludedCard(item.id)) {
				appData.toggleOrderedLot(item.id, true);
				page.counter = appData.getCountItems();
				card.buttonName = 'Удалить из корзины';
			} else {
				appData.toggleOrderedLot(item.id, false);
				page.counter = appData.getCountItems();
				card.buttonName = 'В корзину';
			}
		},
	});

	card.setColorCategory(item.category, settings);
	card.statusButton = item.price;
	modal.render({
		content: card.render({
			title: item.title,
			image: item.image,
			price: item.price,
			category: item.category,
			description: item.description,
		}),
	});
});

//Открыть корзину
events.on('basket:open', () => {
	basket.items = appData.getAddProductInBasket().map((item, index) => {
		const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				appData.toggleOrderedLot(item.id, false);
				page.counter = appData.getCountItems();
				events.emit('basket:open');
			},
		});

		return card.render({
			price: item.price,
			title: item.title,
			index: index + 1,
		});
	});

	modal.render({
		content: basket.render({
			total: appData.getTotal(),
			selected: appData.order.items,
		}),
	});
});

//Открытие модального окна с формой выбора способа оплаты и адреса доставки
events.on('order:open', () => {
	appData.order.total = appData.getTotal();
	modal.render({
		content: orderForm.render({
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

//Выбор способа оплаты
events.on('buttonPayments:select', (button: { button: HTMLButtonElement }) => {
	appData.setOrderField('payment', button.button.getAttribute('name'));
});

//Изменение значения адреса, при вводе в поле формы выбора способа оплаты и адреса доставки,
events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

//Изменение состояния валидации формы выбора способа оплаты и адреса доставки, данных об ошибки
events.on('orderformErrors:change', (errors: Partial<IOrderForm>) => {
	const { address, payment } = errors;
	orderForm.valid = !address && !payment;
	orderForm.errors = Object.values({ address, payment })
		.filter((i) => !!i)
		.join('; ');
});

//Открытие модального окна с формой для ввода контактных данных
events.on('order:submit', () => {
	modal.render({
		content: contactsForm.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

//Изменение значения email/телефона, при вводе в поле формы для ввода контактных данных
events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IContactsForm; value: string }) => {
		appData.setСontactsField(data.field, data.value);
	}
);

//Изменение состояния валидации формы для ввода контактных данных, данных об ошибки
events.on('contactsFormErrors:change', (errors: Partial<IContactsForm>) => {
	const { email, phone } = errors;
	contactsForm.valid = !phone && !email;
	contactsForm.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

///При нажатии кнопки "Оплатить" в форме для ввода контактных данных формируется запрос к серверу с данными заказа
//При успешной отработки сервером запроса, открывается модальное окно с элементом Success
events.on('contacts:submit', () => {
	api
		.orderProduct(appData.order)
		.then((result) => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					orderClear();
					modal.close();
				},
			});

			modal.render({
				content: success.render({
					total: result.total,
				}),
			});

			events.on('order:clear', orderClear);
		})
		.catch((err) => {
			console.error(err);
		});
});

// Блокируем прокрутку страницы, если открыто модальное окно
events.on('modal:open', () => {
	page.locked = true;
});

// Разблокирем прокрутку страницы, если закрыто модальное окно
events.on('modal:close', () => {
	page.locked = false;
});

//Очищает вводимые данные полей, для активации валидации, после закрытия модального окна крестиком/кликом по оверлею
events.on('form:reset', () => {
	appData.resetForm();
});

// Получаем лоты с сервера
api
	.getCardList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});
