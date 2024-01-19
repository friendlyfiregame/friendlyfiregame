import type { TransitionOptions } from "../Transition";
import { Transition } from "../Transition";

export type CurtainDirection = "horizontal" | "vertical";

export interface CurtainTransitionOptions extends TransitionOptions {
    direction?: CurtainDirection;
}

export class CurtainTransition extends Transition {
    private readonly direction: CurtainDirection;

    public constructor({ direction = "horizontal", ...options }: CurtainTransitionOptions) {
        super(options);

        this.direction = direction;
    }

    public draw(ctx: CanvasRenderingContext2D, draw: () => void, width: number, height: number): void {
        const value = this.valueOf();
        if (this.direction === "horizontal") {
            // Draw left half
            ctx.save();
            ctx.translate(Math.round(-width * value / 2), 0);
            ctx.beginPath();
            ctx.rect(0, 0, Math.round(width / 2), height);
            ctx.clip();
            draw();
            ctx.restore();

            // Draw right half
            ctx.save();
            ctx.translate(Math.round(width * value / 2), 0);
            ctx.beginPath();
            ctx.rect(Math.round(width / 2), 0, Math.round(width), height);
            ctx.clip();
            draw();
            ctx.restore();
        } else if (this.direction === "vertical") {
            // Draw upper half
            ctx.save();
            ctx.translate(0, Math.round(-height * value / 2));
            ctx.beginPath();
            ctx.rect(0, 0, width, Math.round(height / 2));
            ctx.clip();
            draw();
            ctx.restore();

            // Draw lower half
            ctx.save();
            ctx.translate(0, Math.round(height * value / 2));
            ctx.beginPath();
            ctx.rect(0, Math.round(height / 2), width, Math.round(height / 2));
            ctx.clip();
            draw();
            ctx.restore();
        }
    }
}
