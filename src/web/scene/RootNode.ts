import { type Game } from "../Game";
import { Direction } from "../geom/Direction";
import type { AffineTransform } from "../graphics/AffineTransform";
import { type Scene } from "../Scene";
import { PostDrawHints, SceneNode } from "./SceneNode";

/**
 * Function signature for updating the root node. This function is exposed to the scene through the constructor so
 * the scene can call it but no one else can by accident.
 */
export type UpdateRootNode = (dt: number, rootTransform?: AffineTransform) => number;

/**
 * Function signature for drawing the root node.
 */
export type DrawRootNode = (ctx: CanvasRenderingContext2D, layer: number, width: number, height: number)
    => PostDrawHints;

/**
 * The root node of a scene.
 *
 * @param T - Optional owner game class.
 */
export class RootNode<T extends Game = Game> extends SceneNode<T> {
    protected override scene: Scene<T, unknown>;

    /**
     * Creates a new root scene node for the given scene. Functions for updating and drawing the root node (and its
     * child nodes) is exposed to the scene through the second parameter. Only the scene can use these exposed
     * functions, no one else can by accident.
     *
     * @param scene - The scene this root node is meant for.
     * @param expose - Callback for exposing the update/draw methods of the root node to the scene so the scene can
     *                 call it without making the methods public.
     */
    public constructor(scene: Scene<T, unknown>, expose: (update: UpdateRootNode, draw: DrawRootNode) => void) {
        super({ anchor: Direction.TOP_LEFT, childAnchor: Direction.TOP_LEFT });
        this.scene = scene;
        expose(this.updateAll.bind(this), this.drawAllWithBounds.bind(this));
    }

    /**
     * Draws this node and its child nodes recursively and then renders the node bounds when enabled.
     *
     * @param ctx    - The rendering context.
     * @param width  - The scene width.
     * @param height - The scene height.
     * @return Hints which suggests further actions after drawing.
     */
    private drawAllWithBounds(ctx: CanvasRenderingContext2D, layer: number, width: number, height: number):
            PostDrawHints {
        const flags = this.drawAll(ctx, layer, width, height);
        if ((flags & PostDrawHints.DRAW_BOUNDS) !== 0) {
            this.drawBounds(ctx);
        }
        return flags;
    }
}
