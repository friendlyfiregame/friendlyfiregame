export class Insets {
    public static readonly EMPTY = new Insets(0);

    public constructor(
        public readonly top: number,
        public readonly right: number = top,
        public readonly bottom: number = top,
        public readonly left: number = right
    ) {}

    public getHorizontal(): number {
        return this.left + this.right;
    }

    public getVertical(): number {
        return this.top + this.bottom;
    }
}
