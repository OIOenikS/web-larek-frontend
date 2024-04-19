
import {Component} from "./base/Components";
import {IProductItem} from "../types/index";
import {ensureElement,formatNumber} from "../utils/utils";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard extends IProductItem {
    index: number;
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

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: number) {
        if (value) {
            this.setText(this._price, `${formatNumber(value)} синапсов`);
        } else {
            this.setText(this._price, '');
        }
    }

    set buttonName(value: string) {
        this.setText(this._button, value);
    }

    set statusButton(value: number) {
        if(!value) {
            this.setDisabled(this._button, true);
        }
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }
    
    set description(value: string) {
        this.setText(this._description, value);
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

    set index(value: number) {
        this.setText(this._itemIndex, String(value));
    } 
}