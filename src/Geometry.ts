export class Point {
    private _x: number;
    private _y: number;
    private _xRounded: number;
    private _yRounded: number;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
        this._xRounded = this.recalculateXRounded();
        this._yRounded = this.recalculateYRounded();
    }

    public get x(): number {
        return this._x;
    }

    public get y(): number {
        return this._y;
    }

    public get xRounded(): number {
        return this._xRounded;
    }

    public get yRounded(): number {
        return this._yRounded;
    }

    public get rounded(): Point {
        return new Point(this._xRounded, this._yRounded);
    }

    public moveTo(x: number, y: number): void {
        this.moveXTo(x);
        this.moveYTo(y);
    }

    public moveXTo(x: number): void {
        this._x = x;

        this.recalculateXRounded()
    }

    public moveYTo(y: number): void {
        this._y = y;

        this.recalculateYRounded()
    }

    public moveBy(x: number, y: number): void {
        this.moveXBy(x);
        this.moveYBy(y);
    }

    public moveXBy(x: number): void {
        this._x += x;

        this.recalculateXRounded()
    }

    public moveYBy(y: number): void {
        this._y += y;

        this.recalculateYRounded()
    }

    private recalculateXRounded(): number {
        this._xRounded = Math.round(this._x);

        return this.xRounded
    }

    private recalculateYRounded(): number {
        this._yRounded = Math.round(this._y);

        return this.yRounded;
    }
}

export class Size {
    private _width: number;
    private _height: number;
    private _widthRounded: number;
    private _heightRounded: number;

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;

        this._widthRounded = this.recalculateWidthRounded();
        this._heightRounded = this.recalculateHeightRounded();
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public get widthRounded(): number {
        return this._widthRounded;
    }

    public get heightRounded(): number {
        return this._heightRounded;
    }

    public get rounded(): Size {
        return new Size(this._widthRounded, this._heightRounded);
    }

    public resize(width: number, height: number): void {
        this.resizeWidth(width);
        this.resizeHeight(height);
    }

    public resizeWidth(width: number): void {
        this._width = width;

        this.recalculateWidthRounded();
    }

    public resizeHeight(height: number): void {
        this._height = height;

        this.recalculateHeightRounded();
    }

    private recalculateWidthRounded(): number {
        this._widthRounded = Math.round(this._width);

        return this._widthRounded;
    }

    private recalculateHeightRounded(): number {
        this._heightRounded = Math.round(this._height);

        return this._heightRounded;
    }
}

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
