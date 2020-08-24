export class Point {
    public static getOrigin(): Point {
        return new Point(0, 0);
    }

    public static upLeft(): Point {
        return new Point(-1, -1);
    }

    public static up(): Point {
        return new Point(0, -1);
    }

    public static upRight(): Point {
        return new Point(1, -1);
    }

    public static right(): Point {
        return new Point(1, 0);
    }

    public static downRight(): Point {
        return new Point(1, 1);
    }

    public static down(): Point {
        return new Point(0, 1);
    }

    public static downLeft(): Point {
        return new Point(-1, 1);
    }

    public static left(): Point {
        return new Point(-1, 0);
    }

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

    public moveUp(): Point {
        return this.moveYBy(-1);
    }

    public moveRight(): Point {
        return this.moveXBy(1);
    }

    public moveDown(): Point {
        return this.moveYBy(1);
    }

    public moveLeft(): Point {
        return this.moveXBy(-1);
    }

    public mirrorHorizontally(): Point {
        this._x = this._x * -1;

        return this;
    }

    public mirrorVertically(): Point {
        this._y = this._y * -1;

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
