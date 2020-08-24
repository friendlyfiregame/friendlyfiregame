import { clamp } from './util';
import { Easing, linear } from './easings';
import { Size } from './geometry/Size';

export type TransitionType = "in" | "out";

export interface TransitionOptions {
    duration?: number;
    reverse?: boolean;
    easing?: Easing;
}

export class Transition {
    private type: TransitionType = "out";
    private readonly duration: number;
    private readonly easing: Easing;
    private elapsed: number = 0;
    private resolve: (() => void) | null = null;
    private promise: Promise<void> | null = null;

    public constructor({ duration = 0.5, easing = linear }: TransitionOptions = {}) {
        this.duration = duration;
        this.easing = easing;
    }

    public valueOf(): number {
        const value = this.easing(clamp(this.elapsed / this.duration, 0, 1));
        return this.type === "out" ? value :  (1 - value);
    }

    public update(dt: number): void {
        if (this.promise != null) {
            this.elapsed += dt;
            if (this.elapsed >= this.duration) {
                this.stop();
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D, draw: () => void, size: Size): void {}

    public start(type: TransitionType): Promise<void> {
        if (this.promise == null) {
            this.type = type;
            this.elapsed = 0;
            this.promise = new Promise(resolve => this.resolve = resolve);
        }
        return this.promise;
    }

    public stop(): void {
        if (this.resolve != null) {
            this.resolve();
            this.resolve = null;
            this.promise = null;
        }
    }
}
