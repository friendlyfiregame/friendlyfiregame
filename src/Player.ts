import { SpeechBubble } from "./SpeechBubble";
import { Game } from "./game";
import {
    PIXEL_PER_METER, GRAVITY, MAX_PLAYER_SPEED, PLAYER_ACCELERATION, PLAYER_JUMP_HEIGHT,
    PLAYER_IDLE_ANIMATION, PLAYER_RUNNING_ANIMATION
} from "./constants";
import { NPC } from './NPC';
import { loadImage } from "./graphics";
import { Sprites } from "./Sprites";
import { PhysicsEntity } from "./PhysicsEntity";

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

export class Player extends PhysicsEntity {
    private flying = false;
    private direction = 1;
    private spriteIndex = SpriteIndex.IDLE0;
    private sprites!: Sprites;
    private moveLeft: boolean = false;
    private moveRight: boolean = false;
    private debug = false;

    private interactionRange = 35;
    private closestNPC: NPC | null = null;
    public activeSpeechBubble: SpeechBubble | null = null;
    public isInDialog = false;

    public constructor(game: Game, x: number, y: number) {
        super(game, x, y, 0.5 * PIXEL_PER_METER, 1.85 * PIXEL_PER_METER);
        document.addEventListener("keydown", event => this.handleKeyDown(event));
        document.addEventListener("keyup", event => this.handleKeyUp(event));
        this.setMaxVelocity(MAX_PLAYER_SPEED);
    }

    public async load(): Promise<void> {
         this.sprites = new Sprites(await loadImage("sprites/main.png"), 4, 3);
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowRight" && !this.isInDialog) {
            this.direction = 1;
            this.moveRight = true;
        } else if (event.key === "ArrowLeft" && !this.isInDialog) {
            this.direction = -1;
            this.moveLeft = true;
        }
        if (event.key === "Enter") {
            if (this.closestNPC && this.closestNPC.hasDialog) {
                this.closestNPC.startDialog();
            }
        }
        if (event.key === " " && !event.repeat && !this.flying && !this.isInDialog) {
            this.setVelocityY(Math.sqrt(2 * PLAYER_JUMP_HEIGHT * GRAVITY));
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
        super.update(dt);

        const world = this.game.world;

        // Player movement
        if (this.moveRight) {
            this.accelerateX(PLAYER_ACCELERATION * dt);
        } else if (this.moveLeft) {
            this.accelerateX(-PLAYER_ACCELERATION * dt);
        } else {
            if (this.getVelocityX() > 0) {
                this.decelerateX(PLAYER_ACCELERATION * dt);
            } else {
                this.decelerateX(-PLAYER_ACCELERATION * dt);
            }
        }

        // Set sprite index depending on movement
        if (this.getVelocityX() === 0 && this.getVelocityY() === 0) {
            this.spriteIndex = getSpriteIndex(SpriteIndex.IDLE0, PLAYER_IDLE_ANIMATION);
            this.flying = false;
        } else {
            if (this.getVelocityY() > 0) {
                this.spriteIndex = SpriteIndex.JUMP;
                this.flying = true;
            } else if (this.getVelocityY() < 0 && this.y - world.getGround(this.x, this.y) > 10) {
                this.spriteIndex = SpriteIndex.FALL;
                this.flying = true;
            } else {
                this.spriteIndex = getSpriteIndex(SpriteIndex.WALK0, PLAYER_RUNNING_ANIMATION);
                this.flying = false;
            }
        }

        // check for npc in interactionRange
        const closestEntity = this.getClosestEntityInRange(this.interactionRange);
        if (closestEntity instanceof NPC) {
            this.closestNPC = closestEntity;
        } else {
            this.closestNPC = null;
        }
    }
}

function getSpriteIndex(startIndex: number, delays: number[]): number {
    const duration = delays.reduce((duration, delay) => duration + delay, 0);
    let time = Date.now() % duration;
    return startIndex + delays.findIndex(value => (time -= value) <= 0);
}
