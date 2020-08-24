export class Padding {
    private _top: number;
    private _right: number;
    private _bottom: number;
    private _left: number;
    private _horizontal: number;
    private _vertical: number;

    constructor(top: number, right: number, bottom: number, left: number) {
        this._left = left;
        this._right = right;
        this._top = top;
        this._bottom = bottom;

        this._horizontal = this._left + this._right;
        this._vertical = this._top + this._bottom;
    }

    get top() {
        return this._top;
    }

    get right() {
        return this._right;
    }

    get bottom() {
        return this._bottom;
    }

    get left() {
        return this._left;
    }

    get horizontal() {
        return this._horizontal;
    }

    get vertical() {
        return this._vertical;
    }
}
