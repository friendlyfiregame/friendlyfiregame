/**
 * Interface for animation classes which can animate an arbitrary target and provides a mechanism to finish the
 * animation immediately.
 *
 * @param T - The animation target
 */
export interface Animation<T> {
    /**
     * Updates the animation.
     *
     * @param target - The target to animate.
     * @param dt     - The time in seconds since the last update.
     * @return True if animation is finished, false if not.
     */
    update(target: T, dt: number): boolean;

    /**
     * Finishes the animation by fast-forwarding the animation index to the end of the animation lifetime. The
     * [[update]] method must always return true after this finish method is called.
     */
    finish(): void;

    /**
     * Cancels the animation by stopping it immediately. The [[update]] method must not be called again after calling
     * this cancel method.
     */
    cancel(): void;

    /**
     * Checks if animation is finished.
     *
     * @return True if animation is finished, false if not.
     */
    isFinished(): boolean;

    /**
     * Checks if animation is canceled.
     *
     * @return True if animation is canceled, false if not.
     */
    isCanceled(): boolean;

    /**
     * Checks if animation is running (not finished and not canceled).
     *
     * @return True if animation is running.
     */
    isRunning(): boolean;

    /**
     * Returns a promise which is resolved when animation stopped running. The promise is resolved with true when
     * animation was finished and false if it was canceled.
     */
    getPromise(): Promise<boolean>
}
