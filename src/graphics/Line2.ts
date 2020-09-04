import { ReadonlyVector2, Vector2 } from "./Vector2";

/**
 * A line connecting two vertices.
 */
export class Line2 {
    private normal: Vector2 | null = null;
    private center: Vector2 | null = null;

    /**
     * Creates a new line from vertex a to vertex b.
     *
     * @param start - The start of the line.
     * @param end   - The end of the line.
     */
    public constructor(
        public start: Vector2,
        public end: Vector2
    ) {}

    /**
     * Returns the normal of the line. For a line in a clock-wise polygon this normal points to the outside of the
     * polygon.
     *
     * @return The line normal. Normalized to a unit vector.
     */
    public getNormal(): ReadonlyVector2 {
        return (this.normal ?? (this.normal = new Vector2())).setComponents(
            this.end.y - this.start.y,
            this.start.x - this.end.x
        ).normalize();
    }

    /**
     * Returns the center of the line.
     *
     * @return The center of the line.
     */
    public getCenter(): ReadonlyVector2 {
        return (this.center ?? (this.center = new Vector2())).setComponents(
            (this.start.x + this.end.x) / 2,
            (this.start.y + this.end.y) / 2
        );
    }

    /**
     * Draws the line to the given 2D canvas rendering context. This only applies the line geometry,
     * you have to stroke it yourself.
     *
     * @param ctx - The canvas rendering context.
     */
    public draw(ctx: CanvasRenderingContext2D): this {
        const { start: a, end: b } = this;
        ctx.moveTo(a.x, a.x);
        ctx.lineTo(b.x, a.y);
        return this;
    }

    /**
     * Draws the line normal to the given 2D canvas rendering context. This only applies the line geometry,
     * you have to stroke it yourself.
     *
     * @param ctx - The canvas rendering context.
     * @param len - Optional custom normal line length.
     */
    public drawNormal(ctx: CanvasRenderingContext2D, len = 25): this {
        const normal = this.getNormal();
        const center = this.getCenter();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x + normal.x * len, center.y + normal.y * len);
        return this;
    }
}
