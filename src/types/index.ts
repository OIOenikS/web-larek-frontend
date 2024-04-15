
//Типизация объекта с данными о карточки, приходящего с сервера
export interface IProductItem{
  id: string;
  description: string;
  image: string;
  title: string;
  category: TCategoryProduct;
  price?: number | null;
}

//Тип для типизации поля category интерфейса ICard типизирующего объект с данными о продукте приходящими с сервера
export type TCategoryProduct = 'софт-скил' | 'другое' | 'дополнительное' | 'кнопка' | 'хард-скил';

export interface IAppState {
  catalog: IProductItem[];
  //basket: string[];
  //preview: string | null;
  //order: IOrder | null;
  //loading: boolean;
}

export type IBasketItem = Pick<IProductItem, 'id'>



export interface IOrderForm {
    payment: string;
    address: string;
}

export interface IContactsForm {
    email: string;
    phone: string;
}


export type TIdProduct = Pick<IProductItem, 'id'>

export interface IOrder extends IOrderForm, IContactsForm {
  total: number;
  items: string[];
}

//Тип объкта содержащего ошибки и их значение
export type FormErrors = Partial<Record<keyof IOrder, string>>;

//После отправки запроса с данными зака, получаем ответ с объектом данного типа, при успешной отработки запрпоса сервером
export interface IOrderResult {
  id: string;
  total: number;
}