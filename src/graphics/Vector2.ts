import { ReadonlyAffineTransform } from "./AffineTransform";

/**
 * Minimal interface of a 2D vector.
 */
export interface Vector2Like {
    x: number;
    y: number;
}

export interface ReadonlyVector2Like {
    readonly x: number;
    readonly y: number;
}

export interface ReadonlyVector2 extends ReadonlyVector2Like {
    /**
     * Returns the length of the vector. If you only need to compare vector lengths so the real length doesn't matter
     * then consider using the faster [[getSquareLength]] method which omits the expensive square root calculation.
     *
     * @return The vector length.
     */
    getLength(): number;

    /**
     * Returns the squared length of the vector. In some cases (Like comparing vector lengths) it is not necessary to
     * compare the real length, it is enough to compare the squared length. This is faster because it only does
     * addition and multiplication without a square root. If you need the real vector length then use the
     * [[getLength]] method instead.
     *
     * @return The squared vector length.
     */
    getSquareLength(): number;

    /**
     * Returns the distance between this vector and the specified one. If you only need to compare vector distances so
     * the real distance doesn't matter then consider using the faster [[getSquareDistance]] method which omits the
     * expensive square root calculation.
     *
     * @param v - The other vector.
     * @return The distance between this vector and the specified one.
     */
    getDistance(v: ReadonlyVector2Like): number;

    /**
     * Returns the squared distance between this vector and the specified one. In some cases (Like comparing
     * vector distances) it is not necessary to compare the real distance, it is enough to compare the squared
     * distance. This is faster because it only does addition and multiplication without a square root. If you need
     * the real vector distance then use the [[getDistance]] method instead.
     *
     * @param v - The other vector.
     * @return The squared distance between the two vectors.
     */
    getSquareDistance(v: ReadonlyVector2Like): number;

    /**
     * Returns the dot product of this vector and the specified one.
     *
     * @param v - The other vector.
     * @return The dot product.
     */
    dot(v: ReadonlyVector2Like): number;

    /**
     * Returns a human-readable string representation of the vector.
     *
     * @param maxFractionDigits - Optional number of maximum fraction digits to use in the string. Defaults to 5.
     * @return The human-readable string representation of the vector.
     */
    toString(maxFractionDigits?: number): string;
}

/**
 * Vector with two floating point components.
 */
export class Vector2 implements ReadonlyVector2Like, Vector2Like {
    /**
     * Creates a new vector with all components set to 0.
     */
    public constructor();

    /**
     * Creates a new vector with the given component values.
     *
     * @param x - The initial X component value.
     * @param y - The initial Y component value.
     */
    public constructor(x: number, y: number);

    public constructor(
        public x: number = 0,
        public y: number = 0
    ) {}

    /** @inheritDoc */
    public toString(): string {
        return `[ ${this.x}, ${this.y} ]`;
    }

    /**
     * Sets the vector component values.
     *
     * @param x - The X component value to set.
     * @param y - The Y component value to set.
     */
    public setComponents(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Sets the vector component values by copying them from the given vector.
     *
     * @param vector - The vector to copy the X and Y component values from.
     */
    public setVector(vector: ReadonlyVector2Like): this {
        this.x = vector.x;
        this.y = vector.y;
        return this;
    }

    /** @inheritDoc */
    public clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    /** @inheritDoc */
    public getSquareLength(): number {
        return this.x ** 2 + this.y ** 2;
    }

    /** @inheritDoc */
    public getLength(): number {
        return Math.sqrt(this.getSquareLength());
    }

    /** @inheritDoc */
    public getSquareDistance(v: ReadonlyVector2Like): number {
        return (this.x - v.x) ** 2 + (this.y - v.y) ** 2;
    }

    /** @inheritDoc */
    public getDistance(v: ReadonlyVector2Like): number {
        return Math.sqrt(this.getSquareDistance(v));
    }

    /** @inheritDoc */
    public dot(v: ReadonlyVector2Like): number {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * Negates this vector.
     */
    public negate(): this {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    /**
     * Resets all components of this vector to 0.
     */
    public reset(): this {
        this.x = this.y = 0;
        return this;
    }

    /**
     * Translates the vector by the given deltas.
     *
     * @param x - The x delta.
     * @param y - The y delta.
     */
    public translate(x: number, y: number): this {
        this.x += x;
        this.y += y;
        return this;
    }

    /**
     * Adds the given vector to this vector.
     *
     * @param summand - The vector to add.
     */
    public add(summand: ReadonlyVector2Like): this {
        this.x += summand.x;
        this.y += summand.y;
        return this;
    }

    /**
     * Subtracts the given vector from this vector.
     *
     * @param subtrahend - The vector to subtract from this vector.
     */
    public sub(subtrahend: ReadonlyVector2Like): this {
        this.x -= subtrahend.x;
        this.y -= subtrahend.y;
        return this;
    }

    /**
     * Multiplies this vector with the specified matrix (In GLSL: `this = matrix * this`).
     *
     * @param matrix - The matrix to multiply this vector with.
     */
    public mul(arg: ReadonlyAffineTransform): this {
        const x = this.x;
        const y = this.y;
        this.x = x * arg.m11 + y * arg.m21 + arg.dx;
        this.y = x * arg.m12 + y * arg.m22 + arg.dy;
        return this;
    }

    /**
     * Multiplies this vector with the inverse of the specified matrix (In GLSL: `this = matrix / this`).
     *
     * @param matrix - The matrix to divide this vector by.
     */
    public div(arg: ReadonlyAffineTransform): this {
        const b11 = arg.m11, b12 = arg.m12;
        const b21 = arg.m21, b22 = arg.m22;
        const x = this.x;
        const y = this.y;
        const d = b11 * b22 - b12 * b21;
        const c11 = b22 / d;
        const c12 = -b12 / d;
        const c21 = -b21 / d;
        const c22 = b11 / d;
        const b31 = arg.dx, b32 = arg.dy;
        this.x = x * c11 + y * c21 + (b21 * b32 - b31 * b22) / d;
        this.y = x * c12 + y * c22 + (b31 * b12 - b11 * b32) / d;
        return this;
    }

    /**
     * Normalizes this vector to a length of 1.
     */
    public normalize(): this {
        const len = this.getLength();
        this.x /= len;
        this.y /= len;
        return this;
    }
}
