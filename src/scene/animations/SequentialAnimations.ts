import { Animation } from "./Animation";

/**
 * Group animation which executes the specified animations sequentially. The grouped animation is finished when the
 * last of its animations finished.
 */
export class SequentialAnimations<T> implements Animation<T> {
    /** The animations to run sequentially. */
    private readonly animations: Animation<T>[];

    /** The currently running animation. */
    private current: Animation<T> | null = null;

    /** The promise to resolve when animation is finished. */
    private promise: Promise<T>;

    /** Resolve function to call for resolving the animation promise. */
    private resolvePromise: null | ((target: T) => void) = null;

    /**
     * Creates a new group of sequential animations.
     *
     * @param animations - The animations to run sequentially.
     */
    public constructor(animations: Animation<T>[]) {
        this.animations = animations;
        this.promise = new Promise(resolve => {
            this.resolvePromise = resolve;
        });
        this.current = animations.shift() ?? null;
    }

    /** @inheritDoc */
    public update(target: T, dt: number): boolean {
        if (this.current != null) {
            if (this.current.update(target, dt)) {
                this.current = this.animations.shift() ?? null;
                return this.update(target, dt);
            }
            return false;
        } else {
            if (this.resolvePromise != null) {
                this.resolvePromise(target);
                this.resolvePromise = null;
            }
            return  true;
        }
    }

    /** @inheritDoc */
    public finish(): void {
        if (this.current != null) {
            this.current.finish();
        }
        for (const animation of this.animations) {
            animation.finish();
        }
    }

    /** @inheritDoc */
    public getPromise(): Promise<T> {
        return this.promise;
    }
}
