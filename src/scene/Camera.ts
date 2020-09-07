import { AffineTransform } from "../graphics/AffineTransform";
import { Game } from "../Game";
import { SceneNode } from "./SceneNode";
import { easeInOutQuad } from "../easings";
import { Animation } from "./animations/Animation";
import { Animator } from "./animations/Animator";
import { CinematicBars } from "./camera/CinematicBars";
import { FadeToBlack } from "./camera/FadeToBlack";

/**
 * Base camera implementation.
 */
export class Camera<T extends Game = Game> {
    /** The current horizontal focus point of the camera within the scene. */
    private x: number = 0;

    /** The current vertical focus point of the camera within the scene. */
    private y: number = 0;

    /** The reference to the game the camera is connected to. */
    protected readonly game: T;

    /**
     * The camera target to follow (if any). When set then the camera automatically follows the center point of the
     * given scene node. When null then camera position is not adjusted automatically.
     */
    private target: SceneNode | null = null;

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

    public readonly cinematicBars = new CinematicBars();

    public readonly fadeToBlack = new FadeToBlack();

    /**
     * Creates a new standard camera for the given game. The camera position is initialized to look at the center
     * of the game screen.
     */
    public constructor(game: T) {
        this.game = game;
        this.x = game.width / 2;
        this.y = game.height / 2;
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
     * Returns the scene transformation which is the screen centering, the custom camera transformation and the
     * camera position combined into one transformation matrix. The scene transformation is cached and automatically
     * invalidated when camera position or transformation is changed.
     *
     * @return The scene transformation.
     */
    public getSceneTransformation(): AffineTransform {
        if (!this.sceneTransformationValid) {
            this.sceneTransformation.reset()
                .translate(this.game.width / 2, this.game.height / 2)
                .mul(this.transformation)
                .translate(-this.x, -this.y);
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

    public scrollToTarget(target: SceneNode, duration = 0.5): this {
        this.target = null;
        const oldX = this.x;
        const oldY = this.y;
        return this.addAnimation(new Animator(
            (camera, value) => {
                const bounds = target.getSceneBounds();
                const newX = bounds.centerX;
                const newY = bounds.centerY;
                const deltaX = newX - oldX;
                const deltaY = newY - oldY;
                camera.x = oldX + deltaX * value;
                camera.y = oldY + deltaY * value;
                if (value === 1) {
                    camera.target = target;
                }
            },
            { duration, easing: easeInOutQuad }
        ));
    }

    public update(dt: number): void {
        this.updateAnimations(dt);
        if (this.target) {
            const bounds = this.target.getSceneBounds();
            this.x = bounds.centerX;
            this.y = bounds.centerY;
        }
        this.cinematicBars.update(dt);
        this.fadeToBlack.update(dt);
    }

    /**
     * Draws this camera. The method can return a boolean
     * which indicates if the scene is not finished yet and must be drawn continuously (for animations for example).
     * The method can also return an optional function which is called after the child nodes are drawn so this can be
     * used for post-drawing operations. This post-draw function then can again return an optional boolean which
     * indicates that scene must be continuously draw itself.
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
