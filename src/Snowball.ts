import { Game } from "./oldgame";
import { PIXEL_PER_METER } from "./constants";
import { PhysicsEntity } from "./PhysicsEntity";

export class Snowball extends PhysicsEntity {
    public constructor(game: Game, x: number, y: number, velocityX: number, velocityY: number) {
        super(game, x, y, 0.25 * PIXEL_PER_METER, 0.25 * PIXEL_PER_METER);
        this.setVelocity(velocityX, velocityY);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.x, -this.y);
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(0, -this.height / 2, this.width / 2, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}
