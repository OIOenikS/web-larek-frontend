import {Api} from './base/Api';
import {ApiListResponse} from '../types/index';
import {IProductItem} from "../types/index";
import {IOrder, IOrderResult} from "../types";

export interface IWebLarekAPI {
    getCardList: () => Promise<IProductItem[]>;
    getCardItem: (id: string) => Promise<IProductItem>;
    orderProduct(order: IOrder): Promise<IOrderResult>;
}

export class WebLarekAPI extends Api implements IWebLarekAPI {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    getCardItem(id: string): Promise<IProductItem> {
        return this.get(`/product/${id}`).then(
            (item: IProductItem) => ({
                ...item,
                image: this.cdn + item.image,
            })
        );
    }

    getCardList(): Promise<IProductItem[]> {
        return this.get('/product')
            .then((data: ApiListResponse<IProductItem>) =>
                data.items.map((item) => ({
                    ...item,
                    image: this.cdn + item.image
                }))
            ) ;
    }

    orderProduct(order: IOrder): Promise<IOrderResult> {
        return this.post('/order', order).then(
            (data: IOrderResult) => data
        );
    }

}