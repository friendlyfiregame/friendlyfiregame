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
}
