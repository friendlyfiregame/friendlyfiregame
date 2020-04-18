import { Vector2 } from './util';


export class Camera {
    public x = 0;
    public y = 0;

    constructor(private target: Vector2) {
    }

    public update() {
        this.x = this.target.x;
        this.y = this.target.y;
    }

    public applyTransform(ctx: CanvasRenderingContext2D): void {
        ctx.translate(-this.x, this.y);
    }
}
