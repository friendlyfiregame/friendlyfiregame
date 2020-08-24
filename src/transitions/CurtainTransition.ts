import { Size } from '../geometry/Size';
import { Transition, TransitionOptions } from "../Transition";

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

    public draw(ctx: CanvasRenderingContext2D, draw: () => void, size: Size) {
        const value = this.valueOf();
        if (this.direction === "horizontal") {
            // Draw left half
            ctx.save();
            ctx.translate(Math.round(-size.width * value / 2), 0);
            ctx.beginPath();
            ctx.rect(0, 0, Math.round(size.width / 2), size.height);
            ctx.clip();
            draw();
            ctx.restore();

            // Draw right half
            ctx.save();
            ctx.translate(Math.round(size.width * value / 2), 0);
            ctx.beginPath();
            ctx.rect(Math.round(size.width / 2), 0, Math.round(size.width), size.height);
            ctx.clip();
            draw();
            ctx.restore();
        } else if (this.direction === "vertical") {
            // Draw upper half
            ctx.save();
            ctx.translate(0, Math.round(-size.height * value / 2));
            ctx.beginPath();
            ctx.rect(0, 0, size.width, Math.round(size.height / 2));
            ctx.clip();
            draw();
            ctx.restore();

            // Draw lower half
            ctx.save();
            ctx.translate(0, Math.round(size.height * value / 2));
            ctx.beginPath();
            ctx.rect(0, Math.round(size.height / 2), size.width, Math.round(size.height / 2));
            ctx.clip();
            draw();
            ctx.restore();
        }
    }
}
