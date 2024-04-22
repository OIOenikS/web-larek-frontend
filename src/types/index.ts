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

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IAppState {
    catalog: IProductItem[];
    order: IOrder;
    formErrors: FormErrors;
}

export interface IOrderResult {
    id: string;
    total: number;
}

export type TSuccess = Pick<IOrderResult, 'total'>

export type ApiListResponse<Type> = {
    total: number,
    items: Type[]
};