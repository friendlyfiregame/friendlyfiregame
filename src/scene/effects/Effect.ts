export interface Effect {
    /**
     * Updates the effect.
     *
     * @param dt - The time delta since last update.
     * @return True when effect is finished, false if still running.
     */
    update(dt: number): boolean;

    /**
     * Draws the effect and is called before a frame is rendered. May return a post-draw function which is called
     * after drawing a frame.
     *
     * @param ctx    - The rendering context.
     * @param width  - The screen width.
     * @param height - The screen height.
     */
    draw(ctx: CanvasRenderingContext2D, width: number, height: number): void | (() => void);

    /**
     * Finishes the effect. Implementations can use this to fast-forward the effect to the end. The
     * [[update]] method must always return true after this finish method is called.
     */
    finish(): void;

    /**
     * Cancels the effect by stopping it immediately. The [[update]] method must not be called again after calling
     * this cancel method.
     */
    cancel(): void;
}
