import { Transition } from "../Transition";

export class FadeTransition extends Transition {
    public draw(ctx: CanvasRenderingContext2D, draw: () => void): void {
        ctx.globalAlpha = 1 - this.valueOf();
        draw();
    }
}
