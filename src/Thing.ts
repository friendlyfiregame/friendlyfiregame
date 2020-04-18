import { Entity } from './Entity';

export class Thing extends Entity {

    async load() {
        this.width = this.height = 20;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.x - (this.width / 2), -this.y - this.height, this.width, this.height);
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
