import _ from "lodash";
import {Model} from "./base/Model";
import {IAppState, IProductItem, IOrder, IOrderForm, IContactsForm, FormErrors} from "../types/index";

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
    formErrors: FormErrors = {};

    toggleOrderedLot(id: string, isIncluded: boolean):void {
        if (isIncluded) {
            this.order.items = _.uniq([...this.order.items, id]);
        } else {
            this.order.items = _.without(this.order.items, id);
        }
    }

    isIncludedCard(cardId:string):boolean {
        return this.order.items.some((itemId) => itemId === cardId)
    }

    getTotal():number {
        return this.order.items.reduce((a, c) => a + this.catalog.find(it => it.id === c).price, 0); 
    }

    setCatalog(items: IProductItem[]):void {
        this.catalog = items;
        this.emitChanges('cards:changed', { catalog: this.catalog });
    }

    getAddProductInBasket():IProductItem[] {
        return this.catalog.filter(item => this.order.items.includes(item.id));
    }
    
    setOrderField(field: keyof IOrderForm, value: string):void {
        this.order[field] = value;

        if (this.validateOrderForm()) {
        }
    }

    validateOrderForm():boolean {
        const errors: typeof this.formErrors = {};
        if (!this.order.payment) {
            errors.payment = 'Необходимо указать способ оплаты';
        }
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this.formErrors = errors;
        this.events.emit('orderformErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    setСontactsField(field: keyof IContactsForm, value: string):void {
        this.order[field] = value;

        if (this.validateСontactsForm()) {
        }
    }

    validateСontactsForm():boolean {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('contactsFormErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    getCountItems():number {
        return this.order.items.length;
    }

    clearBasket() {
        this.order.items.forEach(id => {
            this.toggleOrderedLot(id, false);
        });
    }

}