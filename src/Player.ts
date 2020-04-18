import { SpeechBubble } from "./SpeechBubble";
import { Entity } from './Entity';
import { Game } from "./game";
import { PIXEL_PER_METER, GRAVITY, MAX_PLAYER_SPEED, PLAYER_ACCELERATION, PLAYER_JUMP_HEIGHT } from "./constants";
import { NPC } from './NPC';
import { loadImage } from "./graphics";
import { Sprites } from "./Sprites";

enum SpriteIndex {
    IDLE0 = 0,
    IDLE1 = 1,
    IDLE2 = 2,
    IDLE3 = 3,
    WALK0 = 4,
    WALK1 = 5,
    WALK2 = 6,
    WALK3 = 7,
    JUMP = 8,
    FALL = 9
}

export class Player extends Entity {
    private direction = 1;
    private spriteIndex = SpriteIndex.IDLE0;
    private sprites!: Sprites;
    private moveLeft: boolean = false;
    private moveRight: boolean = false;
    private moveX = 0;
    private moveY = 0;
    private debug = false;

    private interactionRange = 35;
    private closestNPC: NPC | null = null;
    public activeSpeechBubble: SpeechBubble | null = null;

    public constructor(game: Game, x: number, y: number) {
        super(game, x, y, 0.5 * PIXEL_PER_METER, 1.85 * PIXEL_PER_METER);
        document.addEventListener("keydown", event => this.handleKeyDown(event));
        document.addEventListener("keyup", event => this.handleKeyUp(event));
    }

    public async load(): Promise<void> {
         this.sprites = new Sprites(await loadImage("sprites/main.png"), 4, 3);
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowRight") {
            this.direction = 1;
            this.moveRight = true;
        } else if (event.key === "ArrowLeft") {
            this.direction = -1;
            this.moveLeft = true;
        }
        if (event.key === "Enter") {
            if (this.closestNPC && this.closestNPC.hasDialog) {
                this.closestNPC.startDialog();
            }
        }
        if (event.key === " " && !event.repeat) {
            this.moveY = Math.sqrt(2 * PLAYER_JUMP_HEIGHT * GRAVITY);
        }
    }

    private handleKeyUp(event: KeyboardEvent) {
        if (event.key === "ArrowRight") {
            this.moveRight = false;
        } else if (event.key === "ArrowLeft") {
            this.moveLeft = false;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.translate(this.x, -this.y);
        if (this.debug) {
            ctx.strokeRect(-this.width / 2, -this.height, this.width, this.height);
        }
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }
        this.sprites.draw(ctx, this.spriteIndex, 1.2);
        ctx.restore();

        if (this.closestNPC && this.closestNPC.hasDialog) {
            this.drawDialogTip(ctx);
        }
    }

    drawDialogTip(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.strokeText("press 'Enter' to talk", this.x - (this.width / 2), -this.y + 20);
        ctx.restore();
        this.activeSpeechBubble?.draw(ctx, this.x, this.y + 30);
    }

    update(dt: number): void {
        const world = this.game.world;

        this.x += this.moveX * PIXEL_PER_METER * dt / 1000;
        this.y += this.moveY * PIXEL_PER_METER * dt / 1000;

        // Make sure player is on top of the ground.
        this.y = world.getTop(this.x, this.y);

        this.y = world.getBottom(this.x, this.y + this.height) - this.height;

        this.x = world.getLeft(this.x + this.width / 2, this.y + this.height * 3 / 4, this.height / 2) - this.width / 2;
        this.x = world.getRight(this.x - this.width / 2, this.y + this.height * 3 / 4, this.height / 2) + this.width / 2;

        // Player dropping down when there is no ground below
        if (world.collidesWith(this.x, this.y - 1) === 0) {
            this.moveY -= GRAVITY * dt / 1000;
        } else {
            this.moveY = 0;
        }

        // Player moving right
        if (this.moveRight) {
            this.moveX = Math.min(MAX_PLAYER_SPEED, this.moveX + PLAYER_ACCELERATION * dt / 1000);
        } else if (this.moveLeft) {
            this.moveX = Math.max(-MAX_PLAYER_SPEED, this.moveX - PLAYER_ACCELERATION * dt / 1000);
        } else {
            if (this.moveX > 0) {
                this.moveX = Math.max(0, this.moveX - PLAYER_ACCELERATION * dt / 1000);
            } else {
                this.moveX = Math.min(0, this.moveX + PLAYER_ACCELERATION * dt / 1000);
            }
        }

        // check for npc in interactionRange
        const closestEntity = this.getClosestEntityInRange(this.interactionRange);
        if (closestEntity instanceof NPC) {
            this.closestNPC = closestEntity;
        } else {
            this.closestNPC = null;
        }

        if (this.moveX === 0 && this.moveY === 0) {
            this.spriteIndex = SpriteIndex.IDLE0 + Math.floor((Date.now() % 500 / (500 / 4)));
        } else {
            if (this.moveY > 0) {
                this.spriteIndex = SpriteIndex.JUMP;
            } else if (this.moveY < 0) {
                this.spriteIndex = SpriteIndex.FALL;
            } else {
                this.spriteIndex = SpriteIndex.WALK0 + Math.floor((Date.now() % 500 / (500 / 4)));
            }
        }
    }
}
