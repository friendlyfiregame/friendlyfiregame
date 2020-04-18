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
            this.moveX = 75;
        } else if (event.key === "ArrowLeft") {
            this.moveX = -75;
        }
        if (event.key === " " && !event.repeat) {
            this.moveY = 100;
        }
    }

    private handleKeyUp(event: KeyboardEvent) {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            this.moveX = 0;
        }
    }

    async load(): Promise<void> {
        this.width = 20;
        this.height = 30;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.x - (this.width / 2), -this.y - this.height, this.width, this.height);
        ctx.restore();
    }

    update(dt: number): void {
        const world = this.game.world;

        this.x += this.moveX * dt / 1000;
        this.y += this.moveY * dt / 1000;
        this.y = world.getTop(this.x, this.y);


        // Player dropping down
        if (world.collidesWith(this.x, this.y - 1) === 0) {
            this.moveY -= 250 * dt / 1000;
        } else {
            this.moveY = 0;
        }

    }
}
