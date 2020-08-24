import { Direction } from '../geometry/Direction';
import { Size } from '../geometry/Size';
import { Transition, TransitionOptions } from '../Transition';

export interface SlideTransitionOptions extends TransitionOptions {
    direction?: Direction;
}

export class SlideTransition extends Transition {
    private readonly direction: Direction;

    public constructor({ direction = Direction.UP, ...options }: SlideTransitionOptions = {}) {
        super(options);
        this.direction = direction;
    }

    public draw(ctx: CanvasRenderingContext2D, draw: () => void, size: Size) {
        const value = this.valueOf();

        if (this.direction === Direction.UP) {
            ctx.translate(0, -size.height * value);
        } else if (this.direction === Direction.DOWN) {
            ctx.translate(0, size.height * value);
        } else if (this.direction === Direction.LEFT) {
            ctx.translate(-size.width * value, 0);
        } else if (this.direction === Direction.RIGHT) {
            ctx.translate(size.width * value, 0);
        }

        draw();
    }
}
