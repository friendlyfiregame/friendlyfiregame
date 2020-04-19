import { SpeechBubble } from "./SpeechBubble";
import { Game } from "./game";
import {
    PIXEL_PER_METER, GRAVITY, MAX_PLAYER_SPEED, PLAYER_ACCELERATION, PLAYER_JUMP_HEIGHT,
    PLAYER_IDLE_ANIMATION, PLAYER_RUNNING_ANIMATION, PLAYER_BOUNCE_HEIGHT, PLAYER_ACCELERATION_AIR, SHORT_JUMP_GRAVITY
} from "./constants";
import { NPC } from './NPC';
import { loadImage } from "./graphics";
import { Sprites, getSpriteIndex } from "./Sprites";
import { PhysicsEntity } from "./PhysicsEntity";
import { Snowball } from "./Snowball";
import { Environment } from "./World";
import { particles, valueCurves, ParticleEmitter } from './Particles';
import { rnd, rndItem, timedRnd } from './util';
import { entity } from "./Entity";
import { Sound } from "./Sound";
import { Dance } from './Dance';
import { Cloud } from './Cloud';

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

const groundColors = [
    "#806057",
    "#504336",
    "#3C8376",
    "#908784"
];

const bounceColors = [
    "#f06060",
    "#e87f7f",
    "#ff7070"
];

@entity("player")
export class Player extends PhysicsEntity {
    private flying = false;
    private direction = 1;
    private spriteIndex = SpriteIndex.IDLE0;
    private legsSprite!: Sprites;
    private bodySprite!: Sprites;
    private moveLeft: boolean = false;
    private moveRight: boolean = false;
    public jumpDown: boolean = false;
    private debug = false;
    private jumpKeyPressed: boolean | null = false;
    private drowning = 0;
    private readonly startX: number;
    private readonly startY: number;
    private dance: Dance | null = null;

    public speechBubble = new SpeechBubble(this.x, this.y, "white");
    public dialogActive = false;

    private dialogRange = 50;
    private dialogTipText = "press 'Enter' or 'e' to talk";
    private closestNPC: NPC | null = null;
    private dustEmitter: ParticleEmitter;
    private bounceEmitter: ParticleEmitter;
    private drowningSound!: Sound;
    private walkingSound!: Sound;
    private throwingSound!: Sound;
    private jumpingSound!: Sound;
    private bouncingSound!: Sound;

    public constructor(game: Game, x: number, y: number) {
        super(game, x, y, 0.5 * PIXEL_PER_METER, 1.85 * PIXEL_PER_METER);
        this.startX = x;
        this.startY = y;
        document.addEventListener("keydown", event => this.handleKeyDown(event));
        document.addEventListener("keyup", event => this.handleKeyUp(event));
        this.setMaxVelocity(MAX_PLAYER_SPEED);
        this.dustEmitter = particles.createEmitter({
            position: {x: this.x, y: this.y},
            velocity: () => ({ x: rnd(-1, 1) * 26, y: rnd(0.7, 1) * 45 }),
            color: () => rndItem(groundColors),
            size: rnd(1, 2),
            gravity: {x: 0, y: -100},
            lifetime: () => rnd(0.5, 0.8),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });
        this.bounceEmitter = particles.createEmitter({
            position: {x: this.x, y: this.y},
            velocity: () => ({ x: rnd(-1, 1) * 90, y: rnd(0.7, 1) * 60 }),
            color: () => rndItem(bounceColors),
            size: rnd(1.5, 3),
            gravity: {x: 0, y: -120},
            lifetime: () => rnd(0.4, 0.6),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });
    }

    public async load(): Promise<void> {
        this.legsSprite = new Sprites(await loadImage("sprites/main_legs.png"), 4, 3);
        this.bodySprite = new Sprites(await loadImage("sprites/main_body.png"), 4, 3);
        this.drowningSound = new Sound("sounds/drowning/drowning.mp3");
        this.walkingSound = new Sound("sounds/feet-walking/feet-walking.mp3");
        this.throwingSound = new Sound("sounds/throwing/throwing.mp3");
        this.jumpingSound = new Sound("sounds/jumping/jumping.mp3");
        this.bouncingSound = new Sound("sounds/jumping/squish.mp3");
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (this.dance) {
            this.dance.handleKeyDown(event);
            return;
        }
        if (!this.game.camera.isOnTarget() || event.repeat) {
            return;
        }
        if ((event.key === "ArrowRight" || event.key === "d") && !this.dialogActive) {
            this.direction = 1;
            this.moveRight = true;
            this.moveLeft = false;
        } else if ((event.key === "ArrowLeft" || event.key === "a") && !this.dialogActive) {
            this.direction = -1;
            this.moveLeft = true;
            this.moveRight = false;
        } else if (event.key === "Enter" || event.key === "e") {
            if (this.closestNPC && this.closestNPC.hasDialog) {
                this.game.campaign.startPlayerDialogWithNPC(this.closestNPC);
            }
        } else if ((event.key === " " || event.key === "w" || event.key === "ArrowUp") && !this.flying
                && !this.dialogActive) {
            this.setVelocityY(Math.sqrt(2 * PLAYER_JUMP_HEIGHT * GRAVITY));
            this.jumpKeyPressed = true;
            this.jumpingSound.stop();
            this.jumpingSound.play();
        } else if ((event.key === "s" || event.key === "ArrowDown") && !this.dialogActive) {
            this.jumpDown = true;
        } else if (event.key === "t" && !this.dialogActive) {
            this.game.gameObjects.push(new Snowball(this.game, this.x, this.y + this.height * 0.75, 20 * this.direction, 10));
            this.throwingSound.stop();
            this.throwingSound.play();
        }
        if (event.key === "c") {
            if (!this.dance) {
                this.dance = new Dance(this.game, this.x, this.y - 25, 192, "1 1 1 2 1 2  12 11221122 3 3 3");
            }
        }
    }

    private handleKeyUp(event: KeyboardEvent) {
        if (event.key === "ArrowRight" || event.key === "d") {
            this.moveRight = false;
        } else if (event.key === "ArrowLeft" || event.key === "a") {
            this.moveLeft = false;
        } else if (event.key === " " || event.key === "w" || event.key === "ArrowUp") {
            this.jumpKeyPressed = false;
        } else if (event.key === "s" || event.key === "ArrowDown") {
            this.jumpDown = false;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.translate(this.x, -this.y + 1);
        if (this.debug) {
            ctx.strokeRect(-this.width / 2, -this.height, this.width, this.height);
        }
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }
        this.legsSprite.draw(ctx, this.spriteIndex);
        this.bodySprite.draw(ctx, this.spriteIndex);
        ctx.restore();

        if (this.closestNPC && this.closestNPC.hasDialog) {
            this.drawDialogTip(ctx);
        }

        if (this.dance) {
            this.dance.draw(ctx);
        }

        if (this.dialogActive && this.speechBubble.message !== "") {
            this.speechBubble.draw(ctx);
        }
    }

    drawDialogTip(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "white";

        const textWidth = ctx.measureText(this.dialogTipText).width;
        ctx.strokeText(this.dialogTipText, this.x - (this.width / 2) - (textWidth / 2), -this.y + 20);
        ctx.restore();
    }

    private respawn() {
        this.x = this.startX;
        this.y = this.startY;
        this.direction = -1;
        this.setVelocity(0, 0);
    }

    update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);

        const isDrowning = this.game.world.collidesWith(this.x, this.y) === Environment.WATER;
        if (isDrowning) {
            if (this.drowning === 0) {
                this.drowningSound.trigger();
            }
            this.setVelocityX(0);
            this.drowning += dt;
            if (this.drowning > 2) {
                this.respawn();
            }
        } else {
            this.drowning = 0;
        }

        const world = this.game.world;
        const wasFlying = this.flying;
        const prevVelocity = this.getVelocityY();

        // Player movement
        if (!this.game.camera.isOnTarget()) {
            this.moveRight = false;
            this.moveLeft = false;
        }
        const acceleration = this.flying ? PLAYER_ACCELERATION_AIR : PLAYER_ACCELERATION;
        if (!isDrowning) {
            if (this.moveRight) {
                if (!this.flying) {
                    this.walkingSound.play();
                }
                this.accelerateX(acceleration * dt);
            } else if (this.moveLeft) {
                if (!this.flying) {
                    this.walkingSound.play();
                }
                this.accelerateX(-acceleration * dt);
            } else {
                this.walkingSound.stop();
                if (this.getVelocityX() > 0) {
                    this.decelerateX(acceleration * dt);
                } else {
                    this.decelerateX(-acceleration * dt);
                }
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
            } else if (isDrowning || (this.getVelocityY() < 0 && this.y - world.getGround(this.x, this.y) > 10)) {
                this.spriteIndex = SpriteIndex.FALL;
                this.flying = true;
            } else {
                this.spriteIndex = getSpriteIndex(SpriteIndex.WALK0, PLAYER_RUNNING_ANIMATION);
                this.flying = false;
            }
        }

        // check for npc in interactionRange
        const closestEntity = this.getClosestEntityInRange(this.dialogRange);
        if (closestEntity instanceof NPC) {
            this.closestNPC = closestEntity;
        } else {
            this.closestNPC = null;
        }

        // Spawn random dust particles while walking
        if (!this.flying && (Math.abs(this.getVelocityX()) > 1 || wasFlying)) {
            if (timedRnd(dt, 0.2) || wasFlying) {
                this.dustEmitter.setPosition(this.x, this.y);
                const count = wasFlying ? Math.ceil(Math.abs(prevVelocity) / 5) : 1;
                this.dustEmitter.emit(count);
            }
        }

        // Reset jump key state when on ground
        if (!this.flying && this.jumpKeyPressed != null) {
            this.jumpKeyPressed = null;
        }

        // Dance
        if (this.dance) {
            this.dance.setPosition(this.x, this.y);
            const done = this.dance.update(dt);
            if (done) {
                // On cloud -> make it rain
                if (this.dance.wasSuccessful()) {
                    const ground = this.getGround();
                    if (ground && ground instanceof Cloud) {
                        ground.startRain(15);
                    }
                }
                this.dance = null;
            }
        }
    }


    /**
     * If given coordinate collides with the world then the first free Y coordinate above is returned. This can
     * be used to unstuck an object after a new position was set.
     *
     * @param x - X coordinate of current position.
     * @param y - Y coordinate of current position.
     * @return The Y coordinate of the ground below the given coordinate.
     */
    private pullOutOfGround(): number {
        let pulled = 0, col = 0, collidedWith = 0;
        if (this.getVelocityY() <= 0) {
            const world = this.game.world;
            const height = world.getHeight();
            collidedWith = col = world.collidesWith(this.x, this.y, [ this ],
                this.jumpDown ? [ Environment.PLATFORM, Environment.WATER ] : [ Environment.WATER ]);
            while (this.y < height && col) {
                pulled++;
                this.y++;
                col = world.collidesWith(this.x, this.y);
            }
        }
        if (collidedWith) {
            // Bounce on bouncy things
            if (collidedWith === Environment.BOUNCE) {
                this.setVelocityY(Math.sqrt(2 * PLAYER_BOUNCE_HEIGHT * GRAVITY));
                // Nice bouncy particles
                this.bounceEmitter.setPosition(this.x, this.y - 12);
                this.bounceEmitter.emit(20);
                this.dustEmitter.clear();
                this.bouncingSound.stop();
                this.bouncingSound.play();
                // don't let caller know we collided, otherwise they'll override velocity. Don't mind the hack...
                pulled = 0;
            }
        }
        return pulled;
    }

    /**
     * If given coordinate collides with the world then the first free Y coordinate above is returned. This can
     * be used to unstuck an object after a new position was set.
     *
     * @param x - X coordinate of current position.
     * @param y - Y coordinate of current position.
     * @return The Y coordinate of the ground below the given coordinate.
     */
    private pullOutOfCeiling(): number {
        let pulled = 0;
        const world = this.game.world;
        while (this.y > 0 && world.collidesWith(this.x, this.y + this.height, [ this ],
                [ Environment.PLATFORM, Environment.WATER ])) {
            pulled++;
            this.y--;
        }
        return pulled;
    }

    private pullOutOfWall(): number {
        let pulled = 0;
        const world = this.game.world;
        if (this.getVelocityX() > 0) {
            while (world.collidesWithVerticalLine(this.x + this.width / 2, this.y + this.height * 3 / 4,
                    this.height / 2, [ this ], [ Environment.PLATFORM, Environment.WATER ])) {
                this.x--;
                pulled++;
            }
        } else {
            while (world.collidesWithVerticalLine(this.x - this.width / 2, this.y + this.height * 3 / 4,
                    this.height / 2, [ this ], [ Environment.PLATFORM, Environment.WATER ])) {
                this.x++;
                pulled++;
            }
        }
        return pulled;
    }

    protected updatePosition(newX: number, newY: number): void {
        this.x = newX;
        this.y = newY;

        // Check collision with the environment and correct player position and movement
        if (this.pullOutOfGround() !== 0 || this.pullOutOfCeiling() !== 0) {
            this.setVelocityY(0);
        }
        if (this.pullOutOfWall() !== 0) {
            this.setVelocityX(0);
        }
    }

    protected getGravity() {
        if (this.flying && this.jumpKeyPressed === false && this.getVelocityY() > 0) {
            return SHORT_JUMP_GRAVITY;
        } else {
            return GRAVITY;
        }
    }
}
