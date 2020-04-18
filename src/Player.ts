import { Entity } from './Entity';
import { Game } from "./game";

export class Player extends Entity {
    private moveX = 0;
    private moveY = 0;

    public constructor(game: Game, x: number, y: number) {
        super(game, x, y);
        document.addEventListener("keydown", event => this.handleKeyDown(event));
        document.addEventListener("keyup", event => this.handleKeyUp(event));
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowRight") {
            this.moveX = 50;
        } else if (event.key === "ArrowLeft") {
            this.moveX = -50;
        }
        if (event.key === " ") {
            this.moveY = 50;
        }
    }

    private handleKeyUp(event: KeyboardEvent) {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            this.moveX = 0;
        }
        if (event.key === " ") {
            this.moveY = 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.x - 10, -this.y - 30, 20, 30);
        ctx.restore();
    }

    update(dt: number): void {
        this.x += this.moveX * dt / 1000;
        this.y += this.moveY * dt / 1000;
        console.log(this.x, this.y, this.game.world.collidesWith(this.x, this.y));
    }
}
