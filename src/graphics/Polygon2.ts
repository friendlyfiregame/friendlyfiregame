import { Line2 } from "./Line2";
import { ReadonlyVector2, Vector2 } from "./Vector2";
import { ReadonlyAffineTransform } from "./AffineTransform";
import { Bounds2 } from "./Bounds2";

/**
 * A polygon with any number of vertices.
 */
export class Polygon2 {
    public readonly vertices: Vector2[];
    public readonly edges: Line2[] = [];
    private readonly normals: Vector2[] = [];
    private readonly bounds = new Bounds2();

    /**
     * Creates a polygon with the given initial vertices.
     *
     * @param vertices - The polygon vertices.
     */
    public constructor(...vertices: Vector2[]) {
        this.vertices = vertices;
        for (let i = 0, max = vertices.length; i < max; ++i) {
            this.edges.push(new Line2(vertices[i], vertices[i + 1] ?? vertices[0]));
        }
    }

    /**
     * Checks if polygon has at least one vertex.
     *
     * @return True if polygon has at least on vertex, false if not.
     */
    public hasVertices(): boolean {
        return this.vertices.length > 0;
    }

    /**
     * Adds the given vertex at the given index. Polygon edges are automatically corrected.
     *
     * @param vertex - The vertex to add.
     * @param index  - Optional insertion index. If not specified then vertex is added at the end of the polygon.
     */
    public addVertex(vertex: Vector2, index: number = this.vertices.length): this {
        const edge = new Line2(vertex, vertex);
        this.vertices.splice(index, 0, vertex);
        const previousEdge = this.edges[index - 1];
        this.edges.splice(index, 0, edge);
        if (previousEdge != null) {
            edge.end = previousEdge.end;
            previousEdge.end = vertex;
        } else {
            edge.end = this.vertices[0];
        }
        this.bounds.reset();
        return this;
    }

    /**
     * Removes the vertex at the given index. Polygon edges are automatically corrected.
     *
     * @param index - The index of the vertex to remove.
     */
    public removeVertex(index: number): this {
        const edges = this.edges;
        const edge = edges[index];
        if (edge != null) {
            const previousEdge = edges[index - 1] ?? edges[edges.length - 1];
            const nextEdge = edges[index + 1] ?? edges[0];
            if (previousEdge !== edge && nextEdge !== edge) {
                nextEdge.start = edge.end;
                previousEdge.end = edge.end;
            }
            this.vertices.splice(index, 1);
            this.edges.splice(index, 1);
            this.bounds.reset();
        }
        return this;
    }

    /**
     * Removes all vertices from the polygon.
     */
    public clear(): this {
        if (this.hasVertices()) {
            this.vertices.length = 0;
            this.edges.length = 0;
            this.normals.length = 0;
            this.bounds.reset();
        }
        return this;
    }

    /**
     * Returns the vertex normal for the vertex with the given index.
     *
     * @param index - The vertex index.
     * @return The vertex normal.
     */
    public getVertexNormal(index: number): ReadonlyVector2 {
        const normal = this.normals[index]?.reset() ?? (this.normals[index] = new Vector2());
        const edges = this.edges;
        const edge = edges[index];
        if (edge != null) {
            normal.add(edge.getNormal());
            const previousEdge = edges[index - 1] ?? edges[edges.length - 1];
            if (previousEdge != null) {
                normal.add(previousEdge.getNormal());
            }
        }
        return normal.normalize();
    }

    /**
     * Draws the polygon to the given 2D canvas rendering context. This only applies the closed geometry, you have to
     * fill/stroke/clip it yourself.
     *
     * @param ctx - The 2D canvas rendering context to render to.
     */
    public draw(ctx: CanvasRenderingContext2D): this {
        const vertices = this.vertices;
        if (vertices.length > 0) {
            const first = vertices[0];
            ctx.moveTo(first.x, first.y);
            for (let i = 1, max = vertices.length; i < max; ++i) {
                const next = vertices[i];
                ctx.lineTo(next.x, next.y);
            }
        }
        ctx.closePath();
        return this;
    }

    /**
     * Draws the polygon edge normals to the given 2D canvas rendering context. This only applies the line geometries,
     * you have to stroke it yourself.
     *
     * @param ctx - The canvas rendering context.
     * @param len - Optional custom normal line length.
     */
    public drawNormals(ctx: CanvasRenderingContext2D, len?: number): this {
        for (const edge of this.edges) {
            edge.drawNormal(ctx, len);
        }
        return this;
    }

    /**
     * Draws the vertex normals to the given 2D canvas rendering context. This only applies the line geometries,
     * you have to stroke it yourself.
     *
     * @param ctx - The canvas rendering context.
     * @param len - Optional custom normal line length.
     */
    public drawVertexNormals(ctx: CanvasRenderingContext2D, len: number = 25): this {
        this.vertices.forEach((vertex, index) => {
            ctx.moveTo(vertex.x, vertex.y);
            const normal = this.getVertexNormal(index);
            ctx.lineTo(vertex.x + normal.x * len, vertex.y + normal.y * len);
        });
        return this;
    }

    /**
     * Transforms this polygon with the given transformation matrix.
     *
     * @param m - The transformation to apply.
     */
    public transform(m: ReadonlyAffineTransform): this {
        for (const vertex of this.vertices) {
            vertex.mul(m);
        }
        this.bounds.reset();
        return this;
    }

    /**
     * Returns the bounds of the polygon. Bounds are cached and automatically invalidated when polygon is changed
     * or transformed.
     *
     * @return The polygon bounds.
     */
    public getBounds(): Bounds2 {
        if (this.bounds.isEmpty()) {
            this.bounds.addPolygon(this);
        }
        return this.bounds;
    }
}
