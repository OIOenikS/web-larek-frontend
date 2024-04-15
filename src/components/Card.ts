
import {Component} from "./base/Components";
import {TCategoryProduct} from "../types/index";
import {ensureElement} from "../utils/utils";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard {
    description: string;
    image: string;
    title: string;
    category: TCategoryProduct;
    price: number | null;
}

export abstract class Card extends Component<ICard> {
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _category?: HTMLElement;
    protected _button?: HTMLButtonElement;

    constructor(protected container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set price(value: string) {
        if (value) {
            this.setText(this._price, `${value} синапсов`);
        } else {
            this.setText(this._price, '');
        }
    }

    get price(): string {
        return this._price.textContent || '';
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }
    
    set description(value: string) {
        this.setText(this._description, value);
    }

    get description() {
        return this._description.textContent || '';
    }

    set category(value: string) {
        this.setText(this._category, value);
        this.setColorCategory();
    }

    get category(): string {
        return this._category.textContent || '';
    }
    
    setColorCategory() {
        switch (this.category) {
            case 'софт-скил': this.toggleClass(this._category, 'card__category_soft');
                break;
            case 'другое': this.toggleClass(this._category, 'card__category_other');
                break;
            case 'хард-скил': this.toggleClass(this._category, 'card__category_hard');
                break;
            case 'дополнительное': this.toggleClass(this._category, 'card__category_additional');
                break;
            case 'кнопка': this.toggleClass(this._category, 'card__category_button');
                break;
        };
    }
}

export class CardCatalog extends Card {
    
    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container, actions);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._category = ensureElement<HTMLElement>('.card__category', container); 
    }
}

export class CardPreview extends Card {
    
    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container, actions);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._description = ensureElement<HTMLElement>('.card__text', container);
        this._button = ensureElement<HTMLButtonElement>(`.card__button`, container);
    }
    
}

export class CardBasket extends Card {
    protected _itemIndex: HTMLElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container, actions);
        this._button = ensureElement<HTMLButtonElement>(`.card__button`, container);
        this._itemIndex = ensureElement<HTMLImageElement>(`.basket__item-index`, container);
    }

}