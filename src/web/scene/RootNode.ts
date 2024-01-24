import { type Game } from "../Game";
import { Direction } from "../geom/Direction";
import { type Scene } from "../Scene";
import { type PostDrawHints, SceneNode } from "./SceneNode";

/**
 * Function signature for updating the root node. This function is exposed to the scene through the constructor so
 * the scene can call it but no one else can by accident.
 */
export type UpdateRootNode = (dt: number) => number;

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
        expose(this.updateAll.bind(this), this.drawAll.bind(this));
    }
}
