import type { TransitionOptions } from "../Transition";
import { Transition } from "../Transition";

export type SlideDirection = "top" | "left" | "bottom" | "right";

export interface SlideTransitionOptions extends TransitionOptions {
    direction?: SlideDirection;
}

export class SlideTransition extends Transition {
    private readonly direction: SlideDirection;

    public constructor({ direction = "top", ...options }: SlideTransitionOptions = {}) {
        super(options);
        this.direction = direction;
    }

    public draw(ctx: CanvasRenderingContext2D, draw: () => void, width: number, height: number): void {
        const value = this.valueOf();
        if (this.direction === "top") {
            ctx.translate(0, -height * value);
        } else if (this.direction === "bottom") {
            ctx.translate(0, height * value);
        } else if (this.direction === "left") {
            ctx.translate(-width * value, 0);
        } else if (this.direction === "right") {
            ctx.translate(width * value, 0);
        }

        draw();
    }
}
