/**
 * Minimal interface of a 2D size.
 */
export interface Size2Like {
    width: number;
    height: number;
}

export interface ReadonlySize2Like {
    readonly width: number;
    readonly height: number;
}

export interface ReadonlySize2 extends ReadonlySize2Like {
    /**
     * Returns a human-readable string representation of the vector.
     *
     * @param maxFractionDigits - Optional number of maximum fraction digits to use in the string. Defaults to 5.
     * @return The human-readable string representation of the vector.
     */
    toString(maxFractionDigits?: number): string;

    /**
     * Checks if size is empty (width or height is 0 or smaller)
     *
     * @return True if size is empty, false if not.
     */
    isEmpty(): boolean;

    /**
     * Clones this size and returns the clone.
     *
     * @return The clone
     */
    clone(): Size2;

    /**
     * Returns the area of the size (width * height).
     *
     * @return The area.
     */
    getArea(): number;

    /**
     * Returns the aspect ratio of the size (width / height)
     */
    getAspectRatio(): number;
}

/**
 * Mutable 2D size.
 */
export class Size2 implements ReadonlySize2Like, Size2Like {
    /**
     * Creates a new size with all dimensions set to 0.
     */
    public constructor();

    /**
     * Creates a new size with the given dimensions.
     *
     * @param width - The initial width.
     * @param height - The initial height.
     */
    public constructor(width: number, height: number);

    public constructor(
        public width: number = 0,
        public height: number = 0
    ) {}

    /** @inheritDoc */
    public toString(): string {
        return `${this.width}x${this.height}`;
    }

    /**
     * Sets the size dimensions.
     *
     * @param width  - The width to set.
     * @param height - The height to set.
     */
    public setDimensions(width: number, height: number): this {
        this.width = width;
        this.height = height;
        return this;
    }

    /**
     * Sets the size dimensions by copying them from the given size.
     *
     * @param size - The size to copy the dimensions from.
     */
    public setSize(size: ReadonlySize2Like): this {
        this.width = size.width;
        this.height = size.height;
        return this;
    }

    /** @inheritDoc */
    public isEmpty(): boolean {
        return this.width === 0 || this.height === 0;
    }

    /** @inheritDoc */
    public clone(): Size2 {
        return new Size2(this.width, this.height);
    }

    /** @inheritDoc */
    public getArea(): number {
        return this.width * this.height;
    }

    /** @inheritDoc */
    public getAspectRatio(): number {
        return this.width / this.height;
    }
}
