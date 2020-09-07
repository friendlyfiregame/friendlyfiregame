import { Animation } from "./Animation";

/**
 * Group animation which executes specified animations simultaneously. The group animation is finished when all its
 * animations are finished.
 */
export class ParallelAnimations<T> implements Animation<T> {
    /** The animations to run simultaneously. */
    private readonly animations: Animation<T>[];

    /** The promise to resolve when all animations are finished. */
    private promise: Promise<T>;

    /** Resolve function to call for resolving the animation promise. */
    private resolvePromise: null | ((target: T) => void) = null;

    /**
     * Creates a new group of parallel animations.
     *
     * @param animations - The animations to run simultaneously.
     */
    public constructor(animations: Animation<T>[]) {
        this.animations = animations;
        this.promise = new Promise(resolve => {
            this.resolvePromise = resolve;
        });
    }

    /** @inheritDoc */
    public update(target: T, dt: number): boolean {
        const animations = this.animations;
        let numAnimations = animations.length;
        let i = 0;
        while (i < numAnimations) {
            if (animations[i].update(target, dt)) {
                animations.splice(i, 1);
                numAnimations--;
                if (numAnimations === 0) {
                    if (this.resolvePromise != null) {
                        this.resolvePromise(target);
                        this.resolvePromise = null;
                    }
                    return true;
                }
            } else {
                i++;
            }
        }
        return false;
    }

    /** @inheritDoc */
    public finish(): void {
        for (const animation of this.animations) {
            animation.finish();
        }
    }

    /** @inheritDoc */
    public getPromise(): Promise<T> {
        return this.promise;
    }
}
