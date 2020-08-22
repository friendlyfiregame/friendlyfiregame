export class Point {
    public static ORIGIN = new Point(0, 0);

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

    public moveTo(x: number, y: number): Point;

    public moveTo(position: Point): Point;

    public moveTo(pointOrX: Point | number, y?: number): Point {
        if (typeof pointOrX === 'number' && typeof y === 'number') {
            this.moveXTo(pointOrX);
            this.moveYTo(y);
        } else if (pointOrX instanceof Point && typeof y === 'undefined') {
            this.moveXTo(pointOrX.x);
            this.moveYTo(pointOrX.y);
        } else {
            throw new Error('Invalid call signature.');
        }

        return this;
    }

    public moveXTo(x: number): Point {
        this._x = x;

        this.recalculateXRounded()

        return this;
    }

    public moveYTo(y: number): Point {
        this._y = y;

        this.recalculateYRounded()

        return this;
    }

    public moveBy(x: number, y: number): Point;

    public moveBy(position: Point): Point;

    public moveBy(pointOrX: Point | number, y?: number): Point {
        if (typeof pointOrX === 'number' && typeof y === 'number') {
            this.moveXBy(pointOrX);
            this.moveYBy(y);
        } else if (pointOrX instanceof Point && typeof y === 'undefined') {
            this.moveXBy(pointOrX.x);
            this.moveYBy(pointOrX.y);
        } else {
            throw new Error('Invalid call signature.');
        }

        return this;
    }

    public moveXBy(x: number): Point {
        this._x += x;

        this.recalculateXRounded()

        return this;
    }

    public moveYBy(y: number): Point {
        this._y += y;

        this.recalculateYRounded()

        return this;
    }

    public clone(): Point {
        return new Point(this._x, this._y);
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

    public resize(width: number, height: number): Size {
        this.resizeWidth(width);
        this.resizeHeight(height);

        return this;
    }

    public resizeWidth(width: number): Size {
        this._width = width;

        this.recalculateWidthRounded();

        return this;
    }

    public resizeHeight(height: number): Size {
        this._height = height;

        this.recalculateHeightRounded();

        return this;
    }

    public clone(): Size {
        return new Size(this._width, this._height);
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

/*
 * TODO: Maybe use literal object with relative Point definitions like `new Point(0, 1)` instead to
 *       allow unification with existing numeric direction concepts.
 */
export enum Direction {
    UP = 'up',
    RIGHT = 'right',
    DOWN = 'down',
    LEFT = 'left'
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
