import { Easing, linear } from "../../easings";
import { Animation } from "./Animation";

/**
 * Optional named arguments for the [[Animator]] constructor.
 */
export interface AnimatorArgs {
    /** Number of seconds to wait until animations starts. Defaults to 0. */
    delay?: number;

    /** Duration of the animation in seconds. Defaults to 1. */
    duration?: number;

    /** The easing function to use. Defaults to linear. */
    easing?: Easing;
}

/**
 * Type of an animator function which animates the given target. The value grows from 0.0 to 1.0 and the elapsed
 * parameter contains the animation time elapsed so far.
 */
export type AnimatorFunction<T> = (target: T, value: number, elapsed: number) => void;

/**
 * Animation implementation which calls an animator function with a time index from 0.0 to 1.0 (Which can be
 * interpolated with an easing function) to perform the actual animation. It is guaranteed that the animator function
 * is called with value 1.0 when animation is finished.
 */
export class Animator<T> implements Animation<T> {
    /** The animator function. */
    private readonly animator: AnimatorFunction<T>;

    /** The delay in seconds before actual animation starts. */
    private readonly delay: number;

    /** The duration of the animation in seconds. */
    private readonly duration: number;

    /** The total lifetime of the animation (delay + duration). */
    private readonly lifetime: number;

    /** The easing function to use for easing the animation. */
    private readonly easing: Easing;

    /** Time elapsed so far within the animation (including delay). */
    private elapsed: number = 0;

    /** The promise to resolve when animation is finished. */
    private promise: Promise<boolean>;

    /** Resolve function to call for resolving the animation promise. */
    private resolvePromise: null | ((finished: boolean) => void) = null;

    /** Set to true when animation has been canceled. */
    private canceled: boolean = false;

    /**
     * Creates an animation based on the given animator function. Some aspects of the animation can be configured with
     * named options as second argument.
     *
     * @param animator - The animator function which performs the actual animation.
     */
    public constructor(animator: AnimatorFunction<T>, { delay = 0, duration = 1, easing = linear }: AnimatorArgs = {}) {
        this.promise = new Promise(resolve => {
            this.resolvePromise = resolve;
        });
        this.animator = animator;
        this.delay = delay;
        this.duration = duration;
        this.easing = easing;
        this.lifetime = delay + duration;
    }

    /** @inheritDoc */
    public update(target: T, dt: number): boolean {
        if (!this.canceled) {
            this.elapsed += dt;
            if (this.elapsed < this.lifetime) {
                if (this.elapsed > this.delay) {
                    const timeIndex = ((this.elapsed - this.delay) / this.duration) % 1;
                    this.animator(target, this.easing(timeIndex), this.elapsed);
                }
                return false;
            } else {
                if (this.resolvePromise != null) {
                    this.animator(target, 1, this.lifetime);
                    this.resolvePromise(true);
                    this.resolvePromise = null;
                }
                return true;
            }
        } else {
            if (this.resolvePromise != null) {
                this.resolvePromise(false);
                this.resolvePromise = null;
            }
            return true;
        }
    }

    /** @inheritDoc */
    public finish(): void {
        this.elapsed = this.lifetime;
    }

    /** @inheritDoc */
    public cancel(): void {
        this.canceled = true;
    }

    /** @inheritDoc */
    public getPromise(): Promise<boolean> {
        return this.promise;
    }

    /** @inheritDoc */
    public isFinished(): boolean {
        return this.elapsed >= this.lifetime;
    }

    /** @inheritDoc */
    public isCanceled(): boolean {
        return this.canceled;
    }

    /** @inheritDoc */
    public isRunning(): boolean {
        return this.elapsed < this.lifetime && !this.canceled;
    }
}
