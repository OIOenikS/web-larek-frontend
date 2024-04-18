export interface IProductItem{
    id: string;
    description: string;
    image: string;
    title: string;
    category: TCategoryProduct;
    price: number | null;
}

export type TCategoryProduct = 'софт-скил' | 'другое' | 'дополнительное' | 'кнопка' | 'хард-скил';

export interface IOrderForm {
    payment: string;
    address: string;
}

export interface IContactsForm {
    email: string;
    phone: string;
}

export interface IOrder extends IOrderForm, IContactsForm {
    total: number;
    items: string[];
}

export interface IOrderResult {
    id: string;
    total: number;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IAppState {
    catalog: IProductItem[];
    order: IOrder;
    preview: string | null;
    formErrors: FormErrors;
    toggleOrderedLot(id: string, isIncluded: boolean):void; 
    clearBasket():void; 
    setPaymentOrder(value:string):void; 
    getTotal():number; 
    setCatalog(items: IProductItem[]):void; 
    setPreview(item: IProductItem):void; 
    getAddProductInBasket():IProductItem[]; 
    setOrderField(field: keyof IOrderForm, value: string):void; 
    validateOrderForm():boolean;
    setСontactsField(field: keyof IContactsForm, value: string): void; 
    validateСontactsForm():boolean;
}
