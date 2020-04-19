import { Game, CollidableGameObject } from "./game";
import { PIXEL_PER_METER } from "./constants";
import { Environment } from "./World";
import { Entity, entity } from "./Entity";
import { now } from "./util";

@entity("cloud")
export class Cloud extends Entity implements CollidableGameObject {
    public movement = 0;

    public constructor(game: Game, x: number, y: number) {
        super(game, x, y, 5  * PIXEL_PER_METER, 0.75 * PIXEL_PER_METER);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.rect(this.x - this.width / 2, -this.y - this.height, this.width, this.height);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    update(dt: number): void {
        if (now() % 5000 > 2500) {
            this.movement = 75 * dt;
        } else {
            this.movement = -75 * dt;
        }
        this.x += this.movement;
    }

    collidesWith(x: number, y: number, ignore?: Environment[]): number {
        if (x >= this.x - this.width / 2 && x <= this.x + this.width / 2
                && y >= this.y && y <= this.y + this.height) {
            return Environment.SOLID;
        }
        return Environment.AIR;
    }
}
