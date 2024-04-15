import './scss/styles.scss';

import {WebLarekAPI} from "./components/WebLarekAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import {AppState} from "./components/AppData";
import {Page} from "./components/Page";
import {CardBasket, CardCatalog, CardPreview} from "./components/Card";
import {cloneTemplate, ensureElement} from "./utils/utils";
import {IProductItem, IOrderForm, IContactsForm} from './types';
import {Modal} from "./components/Popup";
import {Basket} from "./components/Basket";
import {OrderForm, ContactsForm} from "./components/Form";
import {Success} from "./components/Success";

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

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
const contactsForm = new ContactsForm(cloneTemplate(contactsFormTemplate), events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Изменились элементы каталога
events.on('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            title: item.title,
            price: item.price,
            image: item.image,
            category: item.category,
        });
    });
});

//Открыть карточку тавара
events.on('card:select', (item: IProductItem) => {
    appData.setPreview(item);
});

// Изменен открытый выбранный лот
events.on('preview:changed', (item: IProductItem) => {
    //console.log(appData.getAddProductInBasket())
    const showItem = (item: IProductItem) => {
        const card = new CardPreview(cloneTemplate(cardPreviewTemplate), {
            onClick: () => {
                appData.toggleOrderedLot(item.id, true);
                page.counter = appData.order.items.length
                modal.close();
            }
        });
        
        modal.render({
            content: card.render({
                title: item.title,
                image: item.image,
                price: item.price,
                category: item.category,
                description: item.description,
            })
        });
    };

    if (item) {
        api.getCardItem(item.id)
            .then((result) => {
                item.title = result.title,
                item.image = result.image,
                item.price = result.price,
                item.category = result.category,
                item.description = result.description,
                console.log(item.category)
                showItem(item);
            })
            .catch((err) => {
                console.error(err);
            })
    } else {
        modal.close();
    }
});

//Открыть карзину
events.on('basket:open', () => {

    basket.items = appData.getAddProductInBasket().map(item => {
        const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
            onClick: () => {
            appData.toggleOrderedLot(item.id, false);
            events.emit('basket:open')
            }
        });
        return card.render({
            title: item.title,
            price: item.price,
        });
    });

    basket.total = appData.getTotal();

    modal.render({
        content: 
            basket.render()
    });
});

// Когда нажимаем на кнопку карзины, то сохрапняется общая сумма в объект order открывается и форма для выбора способа доставки и ввода адреса доставки
events.on('order:open', () => {
    appData.order.total = appData.getTotal();
    console.log(appData.order.total);
    modal.render({
        content: orderForm.render({
            address: '',
            valid: false,
            errors: []
        })
    });
});

// Изменилось одно из полей формы для выбора способа доставки и указания адреса доставки. Почему одно поле???
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});

// Изменилось состояние валидации формы для выбора способа доставки и указания адреса доставки (ошибка!), поля формы не заполнены, кнопка submit деактивирована
events.on('OrderformErrors:change', (errors: Partial<IOrderForm>) => {
    const { address } = errors;
    orderForm.valid = !address;
    orderForm.errors = Object.values({address}).filter(i => !!i).join('; ');
});

// Когда мы нажимае на сабмит формы для ввода способа доставки, то сохраняем способ доставки и переходим к форме заполнения почты и телефона
events.on('order:submit', () => {

    modal.render({
        content: contactsForm.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    })
});

// Изменилось одно из полей формы для ввода почты и телефона
events.on(/^contacts\..*:change/, (data: { field: keyof IContactsForm, value: string }) => {
    appData.setСontactsField(data.field, data.value);
});

// Изменилось состояние валидации формы для ввода email и телефона
events.on('contactsFormErrors:change', (errors: Partial<IContactsForm>) => {
    const { email, phone } = errors;
    contactsForm.valid = !phone&&!email;
    contactsForm.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
});

events.on('buttonPayments:select', (button: {button: HTMLButtonElement}) => {
    appData.setPaymentOrder(button.button.getAttribute('name'))
    console.log(appData.order)
});

// Когда мы нажимае на сабмит формы для ввода почты и тефона, то отправим запрос на сервер с данными зака
events.on('contacts:submit', () => {
    api.orderProduct(appData.order)
        .then((result) => {
            const success = new Success(cloneTemplate(successTemplate), {
                onClick: () => {
                    modal.close();
                    //appData.clearBasket();
                    events.emit('auction:changed');
                }
            });

            modal.render({
                content: success.render({})
            });
        })
        .catch(err => {
            console.error(err);
        });
});

// Блокируем прокрутку страницы, если открыто модальное окно
events.on('modal:open', () => {
    page.locked = true;
});

// Разблокирем прокрутку страницы, если открыто модальное окно
events.on('modal:close', () => {
    page.locked = false;
});

// Получаем лоты с сервера
api.getCardList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });


