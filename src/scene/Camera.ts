import { AffineTransform, ReadonlyAffineTransform } from "../graphics/AffineTransform";
import { Game } from "../Game";
import { SceneNode } from "./SceneNode";
import { easeInOutQuad } from "../easings";
import { Animation } from "./animations/Animation";
import { Animator, AnimatorArgs } from "./animations/Animator";
import { CinematicBars } from "./camera/CinematicBars";
import { FadeToBlack as FadeToBlack } from "./camera/FadeToBlack";
import { ReadonlyVector2Like } from "../graphics/Vector2";
import { Rect } from "../geom/Rect";
import { clamp } from "../util";
import { Scene } from "../Scene";

/** Camera target type. Can be a simple position object, a scene node or a function which returns a camera target. */
export type CameraTarget = ReadonlyVector2Like | SceneNode | (() => CameraTarget);

/**
 * Helper function to get the actual position of a camera target which can be of various types.
 *
 * @param target - The camera target.
 * @return The camera target position.
 */
function getCameraTargetPosition(target: CameraTarget): ReadonlyVector2Like {
    if (target instanceof Function) {
        return getCameraTargetPosition(target());
    } else if (target instanceof SceneNode) {
        return target.getScenePosition();
    } else {
        return target;
    }
}

/** Arguments for the focus method. */
export interface FocusArgs extends AnimatorArgs {
    /** Set to true to follow the target after focus animation is done. Defaults to false. */
    follow?: boolean;

    /**
     * The rotation angle to reach on end of animation. Measured in counter-clockwise RAD.
     * Defaults to current camera rotation.
     */
    rotation?: number;

    /** The scale factor to reach on end of animation. Defaults to current camera scale. */
    scale?: number;
}

/**
 * Base camera implementation.
 */
export class Camera<T extends Game = Game> {
        /** The current horizontal focus point of the camera within the scene. */
    private x: number = 0;

    /** The current vertical focus point of the camera within the scene. */
    private y: number = 0;

    /** The current camera scale. */
    private zoom: number = 1;

    /** The current camera rotation in anti-clockwise RAD. */
    private rotation: number = 0;

    /** The game this camera is connected to. */
    private readonly game: T;

    /** The scene this camera is connected to. */
    private readonly scene: Scene<T, unknown>;

    /**
     * The camera target to follow (if any). When set then the camera automatically follows this given target. When null
     * then camera position is not adjusted automatically.
     */
    private follow: CameraTarget | null = null;

    /** Custom camera transformation added on top of the camera position (x and y coordinates). */
    private readonly transformation = new AffineTransform();

    /**
     * The scene transformation of the camera. This combines the camera position (x and y) and its custom
     * [[transformation]].
     */
    private readonly sceneTransformation = new AffineTransform();

    /** Flag which indicates if [[sceneTransformation]] is valid or must be recalculated on next access. */
    private sceneTransformationValid = false;

    /** Array with currently active animations. Animations are automatically removed from the array when finished. */
    private readonly animations: Animation<this>[] = [];

    /** Control the cinematic bars of the camera. */
    public readonly cinematicBars = new CinematicBars();

    /** Controls the fading to black. */
    public readonly fadeToBlack = new FadeToBlack();

    /** The currently playing focus animation. Null if none. */
    private focusAnimation: Animator<this> | null = null;

    /**
     * The current camera limits. Null if no limits. When set then the followed target position is corrected so
     * visible rectangle of camera is within these limits.
     */
    private limits: Rect | null = null;

    /**
     * Creates a new standard camera for the given game. The camera position is initialized to look at the center
     * of the game screen.
     */
    public constructor(scene: Scene<T, unknown>) {
        this.scene = scene;
        this.game = scene.game;
        this.x = this.game.width / 2;
        this.y = this.game.height / 2;
    }

    /** TODO Only needed in FriendlyFire. Remove this in future game and always assume Y goes down. */
    public get yGoesUp(): boolean {
        return this.scene.yGoesUp;
    }

    /**
     * Returns the width of the visible camera area.
     *
     * @return The camera width.
     */
    public getWidth() {
        return this.game.width / this.zoom;
    }

    /**
     * Returns the height of the visible camera area.
     *
     * @return The camera height.
     */
    public getHeight() {
        return this.game.height / this.zoom;
    }

    /**
     * Returns the current horizontal focus point of the camera.
     *
     * @return The camera X position.
     */
    public getX(): number {
        return this.x;
    }

    /**
     * Sets the horizontal focus point of the camera.
     *
     * @param x - The camera X position to set.
     */
    public setX(x: number): this {
        if (x !== this.x) {
            this.x = x;
            this.invalidateSceneTransformation();
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the current vertical focus point of the camera.
     *
     * @return The camera Y position.
     */
    public getY(): number {
        return this.y;
    }

    /**
     * Sets the horizontal focus point of the camera.
     *
     * @param x - The camera Y position to set.
     */
    public setY(y: number): this {
        if (y !== this.y) {
            this.y = y;
            this.invalidateSceneTransformation();
            this.invalidate();
        }
        return this;
    }

    /**
     * Moves the camera focus point to the given coordinates.
     *
     * @param x - The camera X position to set.
     * @param y - The camera Y position to set.
     */
    public moveTo(x: number, y: number): this {
        if (x !== this.x || y !== this.y) {
            this.x = x;
            this.y = y;
            this.invalidateSceneTransformation();
            this.invalidate();
        }
        return this;
    }

    /**
     * Moves the camera focus point by the given delta.
     *
     * @param x - The horizontal delta.
     * @param y - The vertical delta.
     */
    public moveBy(x: number, y: number): this {
        if (x !== 0 || y !== 0) {
            this.x += x;
            this.y += y;
            this.invalidateSceneTransformation();
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the left edge of the visible camera area.
     *
     * @return The left camera edge.
     */
    public getLeft(): number {
        return this.x - this.getWidth() / 2;
    }

    /**
     * Returns the right edge of the visible camera area.
     *
     * @return The right camera edge.
     */
    public getRight(): number {
        return this.x + this.getWidth() / 2;
    }

    /**
     * Returns the top edge of the visible camera area.
     *
     * @return The top camera edge.
     */
    public getTop(): number {
        return this.yGoesUp ? this.y + this.getHeight() / 2 : this.y - this.getHeight() / 2;
    }

    /**
     * Returns the bottom edge of the visible camera area.
     *
     * @return The bottom camera edge.
     */
    public getBottom(): number {
        return this.yGoesUp ? this.y - this.getHeight() / 2 : this.y + this.getHeight() / 2;
    }

    /**
     * Sets the camera zoom.
     *
     * @param zoom - The camera zoom to set.
     */
    public setZoom(zoom: number): this {
        if (zoom !== this.zoom) {
            this.zoom = zoom;
            this.invalidateSceneTransformation();
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the current camera zoom.
     *
     * @return The current camera zoom.
     */
    public getZoom(): number {
        return this.zoom;
    }

    /**
     * Sets the camera rotation.
     *
     * @param scale - The camera rotation to set.
     */
    public setRotation(rotation: number): this {
        if (rotation !== this.rotation) {
            this.rotation = rotation;
            this.invalidateSceneTransformation();
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the camera rotation.
     *
     * @return The current camera rotation.
     */
    public getRotation(): number {
        return this.rotation;
    }

    /**
     * Called when camera is changed and a redraw of the scene is needed.
     */
    private invalidate(): void {
        // TODO Nothing to do here yet. Maybe inform the scene that it needs to redraw the canvas later.
    }

    /**
     * Called when position or transformation of the camera has changed and scene transformation must be
     * recalculated.
     */
    private invalidateSceneTransformation() {
        this.sceneTransformationValid = false;
    }

    /**
     * Transforms the camera with the given transformer. Scene and scene transformation is invalidated after
     * calling the transformer.
     *
     * @param transformer - The transformer function used to modify the transformation matrix.
     */
    public transform(transformer: (transformation: AffineTransform) => void): this {
        transformer(this.transformation);
        this.invalidateSceneTransformation();
        this.invalidate();
        return this;
    }

    /**
     * Returns the custom transformation of the camera which can be manipulated by the [[transform]] method. This
     * transformation is applied on of the camera position which is controlled by the X/Y coordinates. So you
     * can fancy rotations and scaling with it for example.
     *
     * @return The custom node transformation.
     */
    public getTransformation(): ReadonlyAffineTransform {
        return this.transformation;
    }

    /**
     * Returns the scene transformation which is the screen centering, the custom camera transformation and the
     * camera position combined into one transformation matrix. The scene transformation is cached and automatically
     * invalidated when camera position or transformation is changed.
     *
     * @return The scene transformation.
     */
    public getSceneTransformation(): ReadonlyAffineTransform {
        if (!this.sceneTransformationValid) {
            this.sceneTransformation.reset()
                .translate(this.game.width / 2, this.game.height / 2)
                .mul(this.transformation)
                .scale(this.zoom)
                .rotate(this.rotation)
                .translate(-this.x, this.yGoesUp ? this.y : -this.y);
            this.sceneTransformationValid = true;
        }
        return this.sceneTransformation;
    }

    /**
     * Adds a new animation to the scene.
     *
     * @param animation - The animation to add.
     */
    public addAnimation(animation: Animation<this>): this {
        this.animations.push(animation);
        return this;
    }

    /**
     * Runs the given animation and returns when animation is finished/canceled. Promise value is true if animation was
     * finished and false if it was canceled.
     *
     * @param animation - The animation to add.
     * @return True if animation was finished, false if it was canceled.
     */
    public runAnimation(animation: Animation<this>): Promise<boolean> {
        this.addAnimation(animation);
        return animation.getPromise();
    }

    /**
     * Finishes all currently running animations.
     */
    public finishAnimations(): this {
        for (const animation of this.animations) {
            animation.finish();
        }
        return this;
    }

    /**
     * Updates the animations and removes finished animations.
     */
    private updateAnimations(dt: number): void {
        const animations = this.animations;
        let numAnimations = animations.length;
        let i = 0;
        while (i < numAnimations) {
            if (animations[i].update(this, dt)) {
                animations.splice(i, 1);
                numAnimations--;
            } else {
                i++;
            }
        }
    }

    /**
     * Checks if camera has running animations.
     *
     * @return True if camera has running animations, false if not.
     */
    public hasAnimations(): boolean {
        return this.animations.length > 0;
    }

    /**
     * Stops following the currently followed target and focuses the given target. When no animation duration is given
     * then this happens instantly. Otherwise the camera smoothly transitions over to the target. When the follow flag
     * is set then the target is followed after focusing it.
     *
     * It is allowed to change the focus while the animation is still running. The previous animation is then canceled
     * and the new animation transitions from the current position over to the target.
     *
     * @param target - The target scene node to focus.
     * @param args   - Optional focus arguments.
     * @return True when focus was successfully set, false when the transition to the target was canceled by another
     *         focus call.
     */
    public async focus(target: CameraTarget, args: FocusArgs = {}): Promise<boolean> {
        // Cancel already running focus animation
        this.cancelFocus();

        // Unfollow currently followed target
        this.follow = null;

        const oldX = this.x;
        const oldY = this.y;
        const oldScale = this.zoom;
        const newScale = args.scale ?? oldScale;
        const oldRotation = this.rotation;
        const newRotation = args.rotation ?? oldRotation;
        const deltaScale = newScale - oldScale;
        const deltaRotation = newRotation - oldRotation;
        const finished = await this.runAnimation(this.focusAnimation = new Animator(
            (camera, value) => {
                const position = getCameraTargetPosition(target);
                const newX = position.x;
                const newY = position.y;
                const deltaX = newX - oldX;
                const deltaY = newY - oldY;
                if (deltaX !== 0) {
                    camera.x = oldX + deltaX * value;
                }
                if (deltaY !== 0) {
                    camera.y = oldY + deltaY * value;
                }
                if (deltaRotation !== 0) {
                    camera.rotation = oldRotation + deltaRotation * value;
                }
                if (deltaScale !== 0) {
                    camera.zoom = oldScale + deltaScale * value;
                }
                this.invalidate();
                this.invalidateSceneTransformation();
            }, { easing: easeInOutQuad, ...args }
        ));
        if (finished) {
            this.focusAnimation = null;
            if (args.follow === true) {
                this.follow = target;
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns true if camera is currently in a focus animation.
     *
     * @return True if focusing, false if not.
     */
    public isFocusing(): boolean {
        return this.focusAnimation != null;
    }

    /**
     * Cancels a currently running focus animation.
     */
    private cancelFocus(): this {
        if (this.focusAnimation != null) {
            this.focusAnimation.cancel();
            this.focusAnimation = null;
        }
        return this;
    }

    /**
     * Sets the target to follow. Null to stop following the current target.
     *
     * @param target - The target to follow or null to unset.
     */
    public setFollow(target: CameraTarget | null): this {
        if (target !== this.follow) {
            this.cancelFocus();
            this.follow = target;
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the target which the camera follows. Null if none.
     *
     * @return The camera target to follow. Null if none.
     */
    public getFollow(): CameraTarget | null {
        return this.follow;
    }

    public isPointVisible(x: number, y: number, radius = 0): boolean {
        return (
            x >= this.getLeft() - radius
            && y >= this.getTop() - radius
            && x <= this.getRight() + radius
            && y <= this.getBottom() + radius
        );
    }

    /**
     * Sets the camera bounds limits. This applies when following a target (not when focusing). The camera position
     * is limited so the camera bounds are inside the limits.
     *
     * @param limits - The limits to set. Null to unset.
     */
    public setLimits(limits: Rect | null): void {
        this.limits = limits;
    }

    /**
     * Returns the current camera bounds limits.
     *
     * @return The current camera bounds limits.
     */
    public getLimits(): Rect | null {
        return this.limits;
    }

    private limitX(x: number): number {
        if (this.limits) {
            return clamp(x, this.limits.getLeft() + this.getWidth() / 2, this.limits.getRight() - this.getWidth() / 2);
        } else {
            return x;
        }
    }

    private limitY(y: number): number {
        if (this.limits) {
            if (this.yGoesUp) {
                // TODO This darn mirrored Y. Even Rect is not compatible to it when calculating bottom...
                return clamp(y, this.limits.getTop() - this.limits.getHeight() + this.getHeight() / 2,
                    this.limits.getTop() - this.getHeight() / 2);
            } else {
                return clamp(y, this.limits.getTop() + this.getHeight() / 2, this.limits.getBottom() - this.getHeight() / 2);
            }
        } else {
            return y;
        }
    }

    /**
     * Updates the camera. Must be called every time the scene is updated.
     *
     * @param dt - The time delta since last update.
     */
    public update(dt: number): void {
        this.updateAnimations(dt);
        if (this.follow) {
            const position = getCameraTargetPosition(this.follow);
            this.moveTo(this.limitX(position.x), this.limitY(position.y));
        }
        this.cinematicBars.update(dt);
        this.fadeToBlack.update(dt);
    }

    /**
     * Draws this camera. The method can return a boolean which indicates if the scene is not finished yet and must be
     * drawn continuously (for animations for example). The method can also return an optional function which is called
     * after the child nodes are drawn so this can be used for post-drawing operations. This post-draw function then
     * can again return an optional boolean which indicates that scene must be continuously draw itself.
     *
     * @param ctx    - The rendering context.
     * @param width  - The scene width.
     * @param height - The scene height.
     * @return Optional boolean to indicate if scene must be redrawn continuously (Defaults to false) or a post-draw
     *         function which is called after drawing the child nodes and which again can return a flag indicating
     *         continuos redraw.
     */
    public draw(ctx: CanvasRenderingContext2D, width: number, height: number):
            void | boolean | (() => void | boolean) {
        ctx.save();
        this.getSceneTransformation().transformCanvas(ctx);
        return () => {
            ctx.restore();
            let result = this.cinematicBars.draw(ctx, width, height);
            result = this.fadeToBlack.draw(ctx, width, height) || result;
            return result;
        };
    }
}
