import { ControllerManager } from "./input/ControllerManager";
import { Game } from "./Game";
import { Keyboard } from "./input/Keyboard";
import { Scenes } from "./Scenes";
import { Transition } from "./Transition";
import { RootNode, UpdateRootNode, DrawRootNode } from "./scene/RootNode";
import { SceneNode } from "./scene/SceneNode";

/**
 * Constructor type of a scene.
 *
 * @param T - The game type.
 * @param A - Optional scene argument type. A value of this type must be specified when setting or pushing a scene.
 *            Defaults to no argument (void type)
 */
export type SceneConstructor<T extends Game, A = void> = new (game: T) => Scene<T, A>;

/**
 * Abstract base class of a scene.
 *
 * @param T - The game type.
 * @param A - Optional scene argument type. A value of this type must be specified when setting or pushing a scene.
 *            Defaults to no argument (void type)
 */
export abstract class Scene<T extends Game, A = void> {
    public zIndex: number = 0;
    public currentTransition: Transition | null = null;
    public inTransition: Transition | null = null;
    public outTransition: Transition | null = null;
    public readonly rootNode: RootNode<T>;
    private updateRootNode!: UpdateRootNode;
    private drawRootNode!: DrawRootNode;
    private usedLayers: number = 0;
    private hiddenLayers: number = 0;
    private backgroundStyle: string | null = null;

    public constructor(public readonly game: T) {
        this.rootNode = new RootNode(this, (update, draw) => {
            this.updateRootNode = update;
            this.drawRootNode = draw;
        });
        this.rootNode.resizeTo(this.game.width, this.game.height);
    }

    public get keyboard(): Keyboard {
        return this.game.keyboard;
    }

    public get input(): ControllerManager {
        return ControllerManager.getInstance();
    }

    public get scenes(): Scenes<T> {
        return this.game.scenes;
    }

    public get urlFragment(): string {
        return "#";
    }

    /**
     * Shows the given layer when it was previously hidden.
     *
     * @param layer - The layer to show (0-31).
     */
    public showLayer(layer: number): this {
        this.hiddenLayers &= ~(1 << layer);
        return this;
    }

    /**
     * Hides the given layer when it was previously shown.
     *
     * @param layer - The layer to hide (0-31).
     */
    public hideLayer(layer: number): this {
        this.hiddenLayers |= 1 << layer;
        return this;
    }

    /**
     * Checks if given layer is hidden.
     *
     * @param layer - The layer to check (0-31).
     * @return True if layer is hidden, false if not.
     */
    public isLayerHidden(layer: number): boolean {
        return (this.hiddenLayers & (1 << layer)) !== 0;
    }

    /**
     * Checks if given layer is shown.
     *
     * @param layer - The layer to check (0-31).
     * @return True if layer is shown, false if not.
     */
    public isLayerShown(layer: number): boolean {
        return (this.hiddenLayers & (1 << layer)) === 0;
    }

    /**
     * Returns the scene node with the given id.
     *
     * @param id - The ID to look for.
     * @return The matching scene node or null if none.
     */
    public getNodeById(id: string): SceneNode<T> | null {
        return this.rootNode.getDescendantById(id);
    }

    /**
     * Returns the background style of this scene. This style is used to fill the background of the scene when set.
     *
     * @return The scene background style.
     */
    public getBackgroundStyle(): string | null {
        return this.backgroundStyle;
    }

    /**
     * Sets the background style of this scene. This style is used to fill the background of the scene when set.
     *
     * @param backgroundStyle - The background style to set.
     */
    public setBackgroundStyle(backgroundStyle: string | null): this {
        this.backgroundStyle = backgroundStyle;
        return this;
    }

    /**
     * Checks if this scene is active.
     *
     * @return True if scene is active, false it not.
     */
    public isActive(): boolean {
        return this.scenes.activeScene === this;
    }

    /**
     * Called when the scene is pushed onto the stack and before any transitions.
     *
     * @param args - The scene arguments (if any).
     */
    public setup(args: A): Promise<void> | void {
        // Intentionally left empty.
    }

    /**
     * Called when the scene becomes the top scene on the stack and after the on-stage transition is complete.
     */
    public activate(): Promise<void> | void {
        // Intentionally left empty.
    }

    /**
     * Called when the scene is no longer the top scene on the stack and before the off-stage transition begins.
     */
    public deactivate(): Promise<void> | void {
        // Intentionally left empty.
    }

    /**
     * Called when the scene is popped from the scene stack, after any transitions are complete.
     */
    public cleanup(): Promise<void> | void {
        // Intentionally left empty.
    }

    /**
     * Updates the scene. Scenes can overwrite this method to do its own drawing but when you are going to use the
     * scene graph then make sure to call the super method in your overwritten method or the scene graph will not be
     * updated.
     */
    public update(dt: number): void {
        this.usedLayers = this.updateRootNode(dt);
    }

    /**
     * Draws the scene. Scenes can overwrite this method to do its own drawing but when you are going to use the
     * scene graph then make sure to call the super method in your overwritten method or the scene graph will not be
     * rendered.
     *
     * @param ctx    - The rendering context.
     * @param width  - The scene width.
     * @param height - The scene height.
     */
    public draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        if (this.backgroundStyle != null) {
            ctx.save();
            ctx.fillStyle = this.backgroundStyle;
            ctx.fillRect(0, 0, width, height);
        }
        let layer = 1;
        let usedLayers = this.usedLayers & ~this.hiddenLayers;
        while (usedLayers !== 0) {
            if ((usedLayers & 1) === 1) {
                this.drawRootNode(ctx, layer, width, height);
            }
            usedLayers >>>= 1;
            layer <<= 1;
        }
        if (this.backgroundStyle != null) {
            ctx.restore();
        }
    }
}
