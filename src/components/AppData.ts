import _ from "lodash";
//import {dayjs, formatNumber} from "../utils/utils";*/

//import {Model} from "./base/Model";
//import {/*FormErrors, IAppState, IBasketItem,*/ IProductItem, TCategoryProduct, IAppState/*IOrder, IOrderForm, LotStatus*/} from "../types/index";

//import _ from "lodash";
//import {dayjs, formatNumber} from "../utils/utils";

import {Model} from "./base/Model";
import {IAppState, IProductItem, IOrder, IOrderForm, IContactsForm, FormErrors, TIdProduct /*IBasketItem, IOrder, FormErrors, IOrderForm*/} from "../types/index";


export class AppState extends Model<IAppState> {
    catalog: IProductItem[];
    order: IOrder = {
        payment: '',
        address: '',
        email: '',
        phone: '',
        total: 0,
        items: []
    };
    preview: string | null;
    formErrors: FormErrors = {};

    toggleOrderedLot(id: string, isIncluded: boolean) {
        if (isIncluded) {
            this.order.items = _.uniq([...this.order.items, id]);
        } else {
            this.order.items = _.without(this.order.items, id);
        }
    }

    clearBasket() {
        this.order.items.forEach(id => {
            this.toggleOrderedLot(id, false);
            //this.catalog.find(it => it.id === id).clearBid();
        });
    }
    
    //устонавлмвает значение поля payment объекта order
    setPaymentOrder(value:string) {
        if (value === 'card') {
            this.order.payment = 'online';
        } else {
            this.order.payment = 'cash';
        }
    }

    //Возвращает общую сумму отложенных товаров в карзине
    getTotal() {
        return this.order.items.reduce((a, c) => a + this.catalog.find(it => it.id === c).price, 0)
    }

    setCatalog(items: IProductItem[]) {
        this.catalog = items;
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: IProductItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    //Возврашает массив объектов типа IProductItem по товарам, которые были добавлены в корзину
    getAddProductInBasket(): IProductItem[] {
        return this.catalog.filter(item => this.order.items.includes(item.id));
    }
    
    //Сохроняет в поле order информацию о заказе, полученную из формы выбора способа оплаты и адреса доставки, с проверкой на валидность
    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;

        if (this.validateOrderForm()) {
            this.events.emit('orderForm:ready', this.order);
        }
    }

    //Проверяет, что форма способа доставки заполнена. Если поля формы не заполнены, дективируюет кнопку submit формы
    validateOrderForm() {
        const errors: typeof this.formErrors = {};
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this.formErrors = errors;
        this.events.emit('OrderformErrors:change', this.formErrors);
        console.log("Проверка связи")
        return Object.keys(errors).length === 0;
    }

    //Сохроняет в поле order информацию о заказе, полученную из формы для ввода почты и телефона, с проверкой на валидность
    setСontactsField(field: keyof IContactsForm, value: string) {
        this.order[field] = value;

        if (this.validateСontactsForm()) {
            this.events.emit('contactsForm:ready', this.order);
        }
    }

    //Проверяет, что форма для коонтакной информации заполнена. Если поля формы не заполнены, дективируюет кнопку submit формы
    validateСontactsForm() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('contactsFormErrors:change', this.formErrors);
        console.log("Офигеь")
        return Object.keys(errors).length === 0;
    }
}