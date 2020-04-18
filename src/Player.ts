import { Entity } from './Entity';
import { Game } from "./game";
import { NPC } from './NPC';

export class Player extends Entity {
    private moveLeft: boolean = false;
    private moveRight: boolean = false;
    private moveX = 0;
    private moveY = 0;
    private interactionRange = 40;

    public constructor(game: Game, x: number, y: number) {
        super(game, x, y);
        document.addEventListener("keydown", event => this.handleKeyDown(event));
        document.addEventListener("keyup", event => this.handleKeyUp(event));
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowRight") {
            this.moveRight = true;
        } else if (event.key === "ArrowLeft") {
            this.moveLeft = true;
        }
        if (event.key === "Enter") {
            const closestEntity = this.getClosestEntityInRange(this.interactionRange);
            if (closestEntity instanceof NPC) {
                closestEntity.enterConversation();
            }

        }
        if (event.key === " " && !event.repeat) {
            this.moveY = 125;
        }
    }

    private handleKeyUp(event: KeyboardEvent) {
        if (event.key === "ArrowRight") {
            this.moveRight = false;
        } else if (event.key === "ArrowLeft") {
            this.moveLeft = false;
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

        // Make sure player is on top of the ground.
        this.y = world.getTop(this.x, this.y);

        this.y = world.getBottom(this.x, this.y + 30) - 30;

        this.x = world.getLeft(this.x + 10, this.y + 25, 10) - 10;
        this.x = world.getRight(this.x - 10, this.y + 25, 10) + 10;

        // Player dropping down when there is no ground below
        if (world.collidesWith(this.x, this.y - 1) === 0) {
            this.moveY -= 250 * dt / 1000;
        } else {
            this.moveY = 0;
        }

        // Player moving right
        if (this.moveRight) {
            this.moveX = Math.min(100, this.moveX + 300 * dt / 1000);
        } else if (this.moveLeft) {
            this.moveX = Math.max(-100, this.moveX - 300 * dt / 1000);
        } else {
            if (this.moveX > 0) {
                this.moveX = Math.max(0, this.moveX - 300 * dt / 1000);
            } else {
                this.moveX = Math.min(0, this.moveX + 300 * dt / 1000);
            }
        }
    }
}
