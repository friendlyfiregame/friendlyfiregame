import { Entity } from './Entity';

export class Thing extends Entity {
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.x - 10, -this.y - 20, 20, 20);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.restore();
    }

    update(dt: number): void {
        // this.x += 60 * dt / 1000;
    }
}
