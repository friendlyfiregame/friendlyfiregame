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

    public resizeTo(width: number, height: number): Size;

    public resizeTo(size: Size): Size;

    public resizeTo(sizeOrWidth: Size | number, height?: number): Size {
        if (typeof sizeOrWidth === 'number' && typeof height === 'number') {
            this.resizeWidthTo(sizeOrWidth);
            this.resizeHeightTo(height);
        } else if (sizeOrWidth instanceof Size && typeof height === 'undefined') {
            this.resizeWidthTo(sizeOrWidth.width);
            this.resizeHeightTo(sizeOrWidth.height);
        } else {
            throw new Error('Invalid call signature.');
        }

        return this;
    }

    public resizeWidthTo(width: number): Size {
        this._width = width;

        this.recalculateWidthRounded()

        return this;
    }

    public resizeHeightTo(height: number): Size {
        this._height = height;

        this.recalculateHeightRounded()

        return this;
    }

    public resizeBy(width: number, height: number): Size;

    public resizeBy(size: Size): Size;

    public resizeBy(sizeOrWidth: Size | number, height?: number): Size {
        if (typeof sizeOrWidth === 'number' && typeof height === 'number') {
            this.resizeWidthBy(sizeOrWidth);
            this.resizeHeightBy(height);
        } else if (sizeOrWidth instanceof Size && typeof height === 'undefined') {
            this.resizeWidthBy(sizeOrWidth.width);
            this.resizeHeightBy(sizeOrWidth.height);
        } else {
            throw new Error('Invalid call signature.');
        }

        return this;
    }

    public resizeWidthBy(width: number): Size {
        this._width += width;

        this.recalculateWidthRounded()

        return this;
    }

    public resizeHeightBy(height: number): Size {
        this._height += height;

        this.recalculateHeightRounded()

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
