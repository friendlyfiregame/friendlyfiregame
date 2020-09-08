/**
 * Readonly interface for [[AffineTransform]].
 */
export interface ReadonlyAffineTransform {
    /** The horizontal scaling. A value of 1 results in no scaling. */
    readonly m11: number;

    /** The vertical skewing. */
    readonly m12: number;

    /** The horizontal skewing. */
    readonly m21: number;

    /** The vertical scaling. A value of 1 results in no scaling. */
    readonly m22: number;

    /** The horizontal translation (moving). */
    readonly dx: number;

    /** The vertical translation (moving). */
    readonly dy: number;

    /**
     * Returns a clone of this matrix.
     *
     * @return The cloned matrix.
     */
    clone(): AffineTransform;

    /**
     * Converts this matrix into a DOM matrix.
     *
     * @return The created DOM matrix.
     */
    toDOMMatrix(): DOMMatrix;

    /**
     * Returns a human-readable string representation of the matrix.
     *
     * @return The human-readable string representation of the matrix.
     */
    toString(): string;

    /**
     * Checks if matrix is identity.
     *
     * @return True if identity, false if not.
     */
    isIdentity(): boolean;

    /**
     * Returns the determinant of this matrix.
     *
     * @return The determinant of this matrix.
     */
    getDeterminant(): number;

    /**
     * Returns the X translation of the matrix.
     *
     * @return The X translation.
     */
    getTranslationX(): number;

    /**
     * Returns the Y translation of the matrix.
     *
     * @return The Y translation.
     */
    getTranslationY(): number;

    /**
     * Returns the X scale factor of the matrix.
     *
     * @return The X scale factor of the matrix.
     */
    getScaleX(): number;

    /**
     * Returns the Y scale factor of the matrix.
     *
     * @return The Y scale factor of the matrix.
     */
    getScaleY(): number;

    /**
     * Returns the rotation of this matrix in radians.
     *
     * @return The rotation angle in radians.
     */
    getRotation(): number;

    /**
     * Transforms the given 2D canvas rendering context.
     *
     * @param ctx - The 2D canvas rendering context to transform.
     */
    transformCanvas(ctx: CanvasRenderingContext2D): this;

    /**
     * Sets the transformation of the given 2D canvas rendering context.
     *
     * @param ctx - The 2D canvas rendering context to set the transformation on.
     */
    setCanvasTransform(ctx: CanvasRenderingContext2D): this;
}

/**
 * Affine transformation matrix. It behaves like a 3x3 matrix where the third row is always assumed to be 0 0 1.
 * This matrix is useful for 2D transformations and is compatible to the transformations done in a Canvas for example.
 */
export class AffineTransform implements ReadonlyAffineTransform {
    /**
     * Creates a matrix initialized to an identity matrix.
     */
    public constructor();

    /**
     * Creates a new matrix initialized to the given component values.
     *
     * @param m11 - The horizontal scaling. A value of 1 results in no scaling.
     * @param m12 - The vertical skewing.
     * @param m21 - The horizontal skewing.
     * @param m22 - The vertical scaling. A value of 1 results in no scaling.
     * @param dx  - The horizontal translation (moving).
     * @param dy  - The vertical translation (moving).
     */
    public constructor(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number);

    public constructor(
        public m11: number = 1,
        public m12: number = 0,
        public m21: number = 0,
        public m22: number = 1,
        public dx: number = 0,
        public dy: number = 0,
    ) {}

    /**
     * Creates a new affine transformation from the given DOM matrix object.
     *
     * @aram domMatrix - The DOM matrix object. Must be a 2D matrix.
     * @return The created affine transformation.
     */
    public static fromDOMMatrix(domMatrix: DOMMatrix): AffineTransform {
        if (!domMatrix.is2D) {
            throw new Error("Can only create Matrix3 from 2D DOMMatrix");
        }
        return new AffineTransform(
            domMatrix.a, domMatrix.b,
            domMatrix.c, domMatrix.d,
            domMatrix.e, domMatrix.f
        );
    }

    /** @inheritDoc */
    public clone(): AffineTransform {
        return new AffineTransform(this.m11, this.m12, this.m21, this.m22, this.dx, this.dy);
    }

    /** @inheritDoc */
    public toDOMMatrix(): DOMMatrix {
        return new DOMMatrix([ this.m11, this.m12, this.m21, this.m22, this.dx, this.dy ]);
    }

    /** @inheritDoc */
    public toString(): string {
        return `[ ${this.m11}, ${this.m12}, ${this.m21}, ${this.m22}, ${this.dx}, ${this.dy} ]`;
    }

    /**
     * Sets the matrix component values.
     *
     * @param m11 - The horizontal scaling. A value of 1 results in no scaling.
     * @param m12 - The vertical skewing.
     * @param m21 - The horizontal skewing.
     * @param m22 - The vertical scaling. A value of 1 results in no scaling.
     * @param dx  - The horizontal translation (moving).
     * @param dy  - The vertical translation (moving).
     */
    public setComponents(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): this {
        this.m11 = m11;
        this.m12 = m12;
        this.m21 = m21;
        this.m22 = m22;
        this.dx = dx;
        this.dy = dy;
        return this;
    }

    /**
     * Sets the matrix component values from another matrix.
     *
     * @param matrix - The matrix to copy the component values from.
     */
    public setMatrix(matrix: ReadonlyAffineTransform): this {
        this.m11 = matrix.m11;
        this.m12 = matrix.m12;
        this.m21 = matrix.m21;
        this.m22 = matrix.m22;
        this.dx = matrix.dx;
        this.dy = matrix.dy;
        return this;
    }

    /** @inheritDoc */
    public isIdentity(): boolean {
        return this.m11 === 1
            && this.m12 === 0
            && this.m21 === 0
            && this.m22 === 1
            && this.dx === 0
            && this.dy === 0;
    }

    /**
     * Resets this matrix to identity.
     */
    public reset(): this {
        this.m11 = 1;
        this.m12 = 0;
        this.m21 = 0;
        this.m22 = 1;
        this.dx = 0;
        this.dy = 0;
        return this;
    }

    /**
     * Multiplies this matrix with the specified matrix (`this = this * other`).
     *
     * @param other - The other matrix to multiply this one with.
     */
    public mul(other: ReadonlyAffineTransform): this {
        const a11 = this.m11, a12 = this.m12;
        const a21 = this.m21, a22 = this.m22;
        const a31 = this.dx, a32 = this.dy;
        const b11 = other.m11, b12 = other.m12;
        const b21 = other.m21, b22 = other.m22;
        const b31 = other.dx, b32 = other.dy;
        this.m11 = a11 * b11 + a21 * b12;
        this.m12 = a12 * b11 + a22 * b12;
        this.m21 = a11 * b21 + a21 * b22;
        this.m22 = a12 * b21 + a22 * b22;
        this.dx = a11 * b31 + a21 * b32 + a31;
        this.dy = a12 * b31 + a22 * b32 + a32;
        return this;
    }

    /**
     * Divides this matrix by the specified matrix (`this = this / other` which is the same as
     * `this = this * inverse(other)`).
     *
     * @param other - The other matrix to divide this one by.
     */
    public div(other: ReadonlyAffineTransform): this {
        // a = this, b = other
        const a11 = this.m11, a12 = this.m12;
        const a21 = this.m21, a22 = this.m22;
        const a31 = this.dx, a32 = this.dy;
        const b11 = other.m11, b12 = other.m12;
        const b21 = other.m21, b22 = other.m22;
        const b31 = other.dx, b32 = other.dy;

        // d = determinant(b)
        const d = b11 * b22 - b21 * b12;

        // c = invert(b)
        const c11 = b22 / d;
        const c12 = -b12 / d;
        const c21 = -b21 / d;
        const c22 = b11 / d;
        const c31 = (b21 * b32 - b31 * b22) / d;
        const c32 = (b31 * b12 - b11 * b32) / d;

        // this = this * c
        this.m11 = a11 * c11 + a21 * c12;
        this.m12 = a12 * c11 + a22 * c12;
        this.m21 = a11 * c21 + a21 * c22;
        this.m22 = a12 * c21 + a22 * c22;
        this.dx = a11 * c31 + a21 * c32 + a31;
        this.dy = a12 * c31 + a22 * c32 + a32;

        return this;
    }

    /** @inheritDoc */
    public getDeterminant(): number {
        return this.m11 * this.m22 - this.m21 * this.m12;
    }

    /**
     * Inverts this matrix.
     */
    public invert(): this {
        const m11 = this.m11, m12 = this.m12;
        const m21 = this.m21, m22 = this.m22;
        const m31 = this.dx, m32 = this.dy;

        const d = m11 * m22 - m21 * m12;

        this.m11 = m22 / d;
        this.m12 = -m12 / d;
        this.m21 = -m21 / d;
        this.m22 = m11 / d;
        this.dx = (m21 * m32 - m31 * m22) / d;
        this.dy = (m31 * m12 - m11 * m32) / d;

        return this;
    }

    /**
     * Translates this matrix by the specified values.
     *
     * @param dx - The X translation.
     * @param dy - The Y translation.
     */
    public translate(dx: number, dy: number): this {
        this.dx += dx * this.m11 + dy * this.m21;
        this.dy += dx * this.m12 + dy * this.m22;
        return this;
    }

    /**
     * Translates this matrix by the specified X delta.
     *
     * @param d - The X translation delta.
     */
    public translateX(d: number): this {
        this.dx += d * this.m11;
        this.dy += d * this.m12;
        return this;
    }

    /** @inheritDoc */
    public getTranslationX(): number {
        return this.dx;
    }

    /**
     * Translates this matrix by the specified Y delta.
     *
     * @param d - The Y translation delta.
     */
    public translateY(d: number): this {
        this.dx += d * this.m21;
        this.dy += d * this.m22;
        return this;
    }

    /** @inheritDoc */
    public getTranslationY(): number {
        return this.dy;
    }

    /**
     * Sets matrix to a translation matrix.
     *
     * @param dx - The X translation.
     * @param dy - The Y translation.
     */
    public setTranslation(dx: number, dy: number): this {
        this.m11 =  1; this.m12 =  0;
        this.m21 =  0; this.m22 =  1;
        this.dx = dx; this.dy = dy;
        return this;
    }

    /**
     * Creates matrix initialized to a translation matrix.
     *
     * @param dx - The X translation.
     * @param dy - The Y translation.
     */
    public static createTranslation(dx: number, dy: number): AffineTransform {
        return new AffineTransform().setTranslation(dx, dy);
    }

    /**
     * Scales this matrix by the specified factor.
     *
     * @param sx - The X scale factor.
     * @param sy - The Y scale factor. Defaults to X scale factor.
     */
    public scale(sx: number, sy = sx): this {
        this.m11 *= sx;
        this.m12 *= sx;
        this.m21 *= sy;
        this.m22 *= sy;
        return this;
    }

    /**
     * Sets matrix to a scale matrix.
     *
     * @param sx - The X scale factor.
     * @param sy - The Y scale factor. Defaults to X scale factor.
     */
    public setScale(sx: number, sy = sx): this {
        this.m11 = sx; this.m12 =  0;
        this.m21 =  0; this.m22 = sy;
        this.dx =  0; this.dy =  0;
        return this;
    }

    /**
     * Scales this matrix by the specified factor along the X axis.
     *
     * @param s - The scale factor.
     */
    public scaleX(s: number): this {
        this.m11 *= s;
        this.m12 *= s;
        return this;
    }

    /** @inheritDoc */
    public getScaleX(): number {
        return Math.hypot(this.m11, this.m21);
    }

    /**
     * Scales this matrix by the specified factor along the Y axis.
     *
     * @param s - The scale factor.
     */
    public scaleY(s: number): this {
        this.m21 *= s;
        this.m22 *= s;
        return this;
    }

    /** @inheritDoc */
    public getScaleY(): number {
        return Math.hypot(this.m12, this.m22);
    }

    /**
     * Creates matrix initialized to a scale matrix.
     *
     * @param sx - The X scale factor.
     * @param sy - The Y scale factor. Defaults to X scale factor.
     */
    public static createScale(sx: number, sy?: number): AffineTransform {
        return new AffineTransform().setScale(sx, sy);
    }

    /**
     * Rotates this matrix by the given angle.
     *
     * @param angle - The rotation angle in RAD.
     */
    public rotate(angle: number): this {
        const m11 = this.m11, m12 = this.m12;
        const m21 = this.m21, m22 = this.m22;
        const s = Math.sin(angle), c = Math.cos(angle);
        this.m11 = c * m11 + s * m21;
        this.m12 = c * m12 + s * m22;
        this.m21 = c * m21 - s * m11;
        this.m22 = c * m22 - s * m12;
        return this;
    }

    /** @inheritDoc */
    public getRotation(): number {
        const m11 = this.m11, m12 = this.m12;
        const m21 = this.m21, m22 = this.m22;
        if (m11 !== 0 || m21 !== 0) {
            const acos = Math.acos(m11 / Math.hypot(m11, m21));
            return m21 > 0 ? -acos : acos;
        } else if (m12 !== 0 || m22 !== 0) {
            const acos = Math.acos(m12 / Math.hypot(m12, m22));
            return Math.PI / 2 + (m22 > 0 ? -acos : acos);
        } else {
            return 0;
        }
    }

    /**
     * Sets matrix to a rotation matrix.
     *
     * @param angle - The rotation angle in RAD.
     */
    public setRotation(angle: number): this {
        const s = Math.sin(angle), c = Math.cos(angle);
        this.m11 =  c; this.m12 = s;
        this.m21 = -s; this.m22 = c;
        this.dx =  0; this.dy = 0;
        return this;
    }

    /**
     * Create new matrix initialized to a rotation matrix.
     *
     * @param angle - The rotation angle in RAD.
     */
    public static createRotation(angle: number): AffineTransform {
        return new AffineTransform().setRotation(angle);
    }

    /** @inheritDoc */
    public transformCanvas(ctx: CanvasRenderingContext2D): this {
        ctx.transform(this.m11, this.m12, this.m21, this.m22, this.dx, this.dy);
        return this;
    }

    /** @inheritDoc */
    public setCanvasTransform(ctx: CanvasRenderingContext2D): this {
        ctx.setTransform(this.m11, this.m12, this.m21, this.m22, this.dx, this.dy);
        return this;
    }
}
