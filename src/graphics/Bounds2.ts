import { Line2 } from "./Line2";
import { ReadonlyVector2Like } from "./Vector2";
import { Polygon2 } from "./Polygon2";
import { Rect } from "../geom/Rect";

export class Bounds2 {
    public minX: number = Infinity;
    public maxX: number = -Infinity;
    public minY: number = Infinity;
    public maxY: number = -Infinity;

    public get centerX(): number {
        return this.minX + this.width / 2;
    }

    public get centerY(): number {
        return this.minY + this.height / 2;
    }

    public get width(): number {
        return this.maxX - this.minX;
    }

    public get height(): number {
        return this.maxY - this.minY;
    }

    public reset(): this {
        this.minX = this.minY = Infinity;
        this.maxX = this.maxY = -Infinity;
        return this;
    }

    public isEmpty(): boolean {
        return this.minX > this.maxX || this.minY > this.maxY;
    }

    public addVertex(vertex: ReadonlyVector2Like): this {
        this.minX = Math.min(this.minX, vertex.x);
        this.maxX = Math.max(this.maxX, vertex.x);
        this.minY = Math.min(this.minY, vertex.y);
        this.maxY = Math.max(this.maxY, vertex.y);
        return this;
    }

    public addLine(line: Line2): this {
        return this.addVertex(line.start).addVertex(line.end);
    }

    public addPolygon(polygon: Polygon2): this {
        for (const vertex of polygon.vertices) {
            this.addVertex(vertex);
        }
        return this;
    }

    public toRect(): Rect {
        return new Rect(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
    }

    /**
     * Checks if this bounding box collides with the given one.
     *
     * @param other - The other bounding box to check collision with.
     * @return True if bounding boxes collide, false if not.
     */
    public collidesWith(other: Bounds2): boolean {
        return this.minY <= other.maxY && this.maxY >= other.minY && this.minX <= other.maxX && this.maxX >= other.minX;
    }

    /**
     * Checks if this bounding box contains the given point.
     *
     * @param x - The X coordinate in scene coordinate system.
     * @param y - The Y coordinate in scene coordinate system.
     * @return True if bounding box contains the point, false if not.
     */
    public containsPoint(x: number, y: number): boolean {
        return this.minY <= y && this.maxY >= y && this.minX <= y && this.maxX >= y;
    }

    /**
     * Draws the bounds to the given 2D canvas rendering context. This only applies the closed geometry, you have to
     * fill/stroke/clip it yourself.
     *
     * @param ctx - The 2D canvas rendering context to render to.
     */
    public draw(ctx: CanvasRenderingContext2D): this {
        if (!this.isEmpty()) {
            ctx.rect(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
        }
        return this;
    }
}
