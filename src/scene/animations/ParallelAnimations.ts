import { Animation } from "./Animation";

/**
 * Group animation which executes specified animations simultaneously. The group animation is finished when all its
 * animations are finished.
 */
export class ParallelAnimations<T> implements Animation<T> {
    /** The animations to run simultaneously. */
    private readonly animations: Animation<T>[];

    /** The promise to resolve when all animations are finished. */
    private promise: Promise<boolean>;

    /** Resolve function to call for resolving the animation promise. */
    private resolvePromise: null | ((finished: boolean) => void) = null;

    /** Flag set to true when animation was canceled. */
    private canceled: boolean = false;

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
                        this.resolvePromise(!this.canceled);
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
    public cancel(): void {
        this.canceled = true;
        for (const animation of this.animations) {
            animation.cancel();
        }
    }

    /** @inheritDoc */
    public getPromise(): Promise<boolean> {
        return this.promise;
    }

    /** @inheritDoc */
    public isFinished(): boolean {
        return this.animations.length === 0 && !this.canceled;
    }

    /** @inheritDoc */
    public isCanceled(): boolean {
        return this.canceled;
    }

    /** @inheritDoc */
    public isRunning(): boolean {
        return this.animations.length > 0 && !this.canceled;
    }
}
