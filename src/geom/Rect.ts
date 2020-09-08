export class Rect {
    public constructor(
        private left: number,
        private top: number,
        private width: number,
        private height: number
    ) {}

    public getLeft(): number {
        return this.left;
    }

    public getTop(): number {
        return this.top;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getRight(): number {
        return this.width + this.left;
    }

    public getBottom(): number {
        return this.height + this.top;
    }

    public getCenterX(): number {
        return this.left + this.width / 2;
    }

    public getCenterY(): number {
        return this.top + this.height / 2;
    }
}
