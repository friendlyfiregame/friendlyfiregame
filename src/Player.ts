import { SpeechBubble } from "./SpeechBubble";
import { Game, GameStage } from "./game";
import {
    PIXEL_PER_METER, GRAVITY, MAX_PLAYER_SPEED, PLAYER_ACCELERATION, PLAYER_JUMP_HEIGHT,
    PLAYER_IDLE_ANIMATION, PLAYER_RUNNING_ANIMATION, PLAYER_BOUNCE_HEIGHT, PLAYER_ACCELERATION_AIR, SHORT_JUMP_GRAVITY,
    PLAYER_DANCING_ANIMATION, PLAYER_FAIL_ANIMATION
} from "./constants";
import { NPC } from './NPC';
import { loadImage } from "./graphics";
import { Sprites, getSpriteIndex } from "./Sprites";
import { PhysicsEntity } from "./PhysicsEntity";
import { Snowball } from "./Snowball";
import { Environment } from "./World";
import { particles, valueCurves, ParticleEmitter } from './Particles';
import { rnd, rndItem, timedRnd, sleep, rndInt } from './util';
import { entity } from "./Entity";
import { Sound } from "./Sound";
import { Dance } from './Dance';
import { Stone, StoneState } from "./Stone";
import { Cloud } from './Cloud';
import { Seed, SeedState } from "./Seed";
import { PlayerConversation } from './PlayerConversation';
import { Wood, WoodState } from "./Wood";
import { Fire } from "./Fire";
import { Tree } from "./Tree";
import { FlameBoy } from "./FlameBoy";

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
    FALL = 9,
    CARRY0 = 10,
    CARRY1 = 11,
    DANCE0 = 12,
    DANCE1 = 13,
    DANCE2 = 14,
    DANCE3 = 15,
    DANCE4 = 16,
    DANCE5 = 17,
    FAIL0 = 18,
    FAIL1 = 19
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

const doubleJumpColors = [
    "#ffffff",
    "#cccccc",
    "#aaaaaa"
];

const drownThoughts = [
    { message: "Ok, I'm not Jesus. Noted!", duration: 4000 },
    { message: "Looks like I can't swim... But I can respawn, nice!", duration: 5000 },
    { message: "Well, that was strange... And wet.", duration: 4000 }
];

const drowningThoughts = [
    { message: "Waah!", duration: 1000 },
    { message: "Help!", duration: 1000 },
    { message: "Mama!", duration: 1000 },
    { message: "Ieeh!", duration: 1000 },
    { message: "Argh!", duration: 1000 }
];

export enum Milestone {
    JUST_ARRIVED,
    TALKED_TO_FIRE,
    TALKED_TO_TREE,
    GOT_SEED,
    PLANTED_SEED,
    TALKED_TO_STONE,
    GOT_STONE,
    THROWN_STONE_INTO_WATER,
    TALKED_TO_FLAMEBOY,
    MADE_RAIN,
    GOT_WOOD,
    THROWN_WOOD_INTO_FIRE
}

export enum Gender { MALE, FEMALE }
export enum SpritePart { LEGS, BODY, HEAD }
export enum PlayerLegSprite { MALE, FEMALE }
export enum PlayerBodySprite { MALE, FEMALE }
export enum PlayerHeadSprite { MALE, MALE_BEARD, FEMALE }
export type PlayerSprites = Record<SpritePart, Sprites[]>

/** The number of seconds until player gets a hint. */
const HINT_TIMEOUT = 90;

@entity("player")
export class Player extends PhysicsEntity {
    private milestone = Milestone.JUST_ARRIVED;
    private lastHint = Date.now();
    private flying = false;
    private gender = Gender.MALE;
    public direction = 1;
    public playerSprites: PlayerSprites = {
        [SpritePart.LEGS]: [],
        [SpritePart.BODY]: [],
        [SpritePart.HEAD]: []
    }
    private spriteIndex = SpriteIndex.IDLE0;
    private legSpriteIndex = PlayerLegSprite.MALE;
    private bodySpriteIndex = PlayerBodySprite.MALE;
    private headSpriteIndex = PlayerHeadSprite.MALE;
    private moveLeft: boolean = false;
    private moveRight: boolean = false;
    public jumpDown: boolean = false;
    private jumpKeyPressed: boolean | null = false;
    private drowning = 0;
    private readonly startX: number;
    private readonly startY: number;
    private dance: Dance | null = null;
    private currentFailSpriteIndex = 0;
    private carrying: PhysicsEntity | null = null;
    public doubleJump = false;
    public multiJump = false;
    private usedDoubleJump = false;
    private hasBeard = false;

    public playerConversation: PlayerConversation | null = null;
    public speechBubble = new SpeechBubble(this.game, this.x, this.y, "white", true);
    public thinkBubble: SpeechBubble | null = null;

    private dialogRange = 50;
    private dialogTipText = "Press 'Enter' or 'E' to talk";
    private closestNPC: NPC | null = null;
    private dustEmitter: ParticleEmitter;
    private bounceEmitter: ParticleEmitter;
    private doubleJumpEmitter: ParticleEmitter;
    private drowningSound!: Sound;
    private walkingSound!: Sound;
    private throwingSound!: Sound;
    private jumpingSounds: Sound[] = [];
    private landingSound!: Sound;
    private bouncingSound!: Sound;

    public constructor(game: Game, x: number, y: number) {
        super(game, x, y, 0.5 * PIXEL_PER_METER, 1.85 * PIXEL_PER_METER);
        this.startX = x;
        this.startY = y;
        document.addEventListener("keydown", event => this.handleKeyDown(event));
        document.addEventListener("keyup", event => this.handleKeyUp(event));
        if (this.game.dev) {
            console.log("Dev mode, press C to dance anywhere, P to spawn the stone, O to spawn the seed, I to spawn " +
                "wood, T to throw useless snowball, K to learn all abilities");
        }
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
        this.doubleJumpEmitter = particles.createEmitter({
            position: {x: this.x, y: this.y},
            velocity: () => ({ x: rnd(-1, 1) * 90, y: rnd(-1, 0) * 100 }),
            color: () => rndItem(doubleJumpColors),
            size: rnd(1.5, 3),
            gravity: {x: 0, y: -120},
            lifetime: () => rnd(0.4, 0.6),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });
    }

    public async load(): Promise<void> {
        this.playerSprites[SpritePart.LEGS].push(
            new Sprites(await loadImage("sprites/pc/male_legs.png"), 4, 5), // Standard male legs
            new Sprites(await loadImage("sprites/pc/female_legs.png"), 4, 5) // Standard female legs
        )
        this.playerSprites[SpritePart.BODY].push(
            new Sprites(await loadImage("sprites/pc/male_body.png"), 4, 5), // Standard male body
            new Sprites(await loadImage("sprites/pc/female_body.png"), 4, 5) // Standard male body
        )
        this.playerSprites[SpritePart.HEAD].push(
            new Sprites(await loadImage("sprites/pc/male_head.png"), 4, 5), // Standard male head
            new Sprites(await loadImage("sprites/pc/male_head_beard.png"), 4, 5), // Standard male head with beard
            new Sprites(await loadImage("sprites/pc/female_head.png"), 4, 5), // Standard male head
        )

        this.drowningSound = new Sound("sounds/drowning/drowning.mp3");
        this.walkingSound = new Sound("sounds/feet-walking/steps_single.mp3");
        this.throwingSound = new Sound("sounds/throwing/throwing.mp3");
        this.jumpingSounds.push(
            new Sound("sounds/jumping/jumping.mp3"),
            new Sound("sounds/jumping/jumping_female.mp3")
        );
        this.landingSound = new Sound("sounds/jumping/landing.mp3");
        this.bouncingSound = new Sound("sounds/jumping/squish.mp3");
    }

    public toggleGender () {
        this.gender = this.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;
        if (this.gender === Gender.MALE) {
            this.legSpriteIndex = PlayerLegSprite.MALE;
            this.bodySpriteIndex = PlayerBodySprite.MALE;
            this.headSpriteIndex = PlayerHeadSprite.MALE;
        } else {
            this.legSpriteIndex = PlayerLegSprite.FEMALE;
            this.bodySpriteIndex = PlayerBodySprite.FEMALE;
            this.headSpriteIndex = PlayerHeadSprite.FEMALE;
        }
    }

    private async handleKeyDown(event: KeyboardEvent) {
        if (this.game.stage === GameStage.TITLE) {
            return;
        }
        if (this.dance) {
            this.dance.handleKeyDown(event);
            return;
        }
        if (!this.game.camera.isOnTarget() || event.repeat) {
            return;
        }
        if (this.playerConversation) {
            this.playerConversation.handleKey(event);
            return;
        }
        if ((event.key === "ArrowRight" || event.key === "d")) {
            this.direction = 1;
            this.moveRight = true;
            this.moveLeft = false;
        } else if ((event.key === "ArrowLeft" || event.key === "a")) {
            this.direction = -1;
            this.moveLeft = true;
            this.moveRight = false;
        } else if (event.key === "Enter" || event.key === "e") {
            if (!this.isCarrying() && this.closestNPC && this.closestNPC.isReadyForConversation() &&
                    this.closestNPC.conversation) {
                this.playerConversation = new PlayerConversation(this, this.closestNPC, this.closestNPC.conversation);
                if (this.closestNPC instanceof Fire) {
                    this.achieveMilestone(Milestone.TALKED_TO_FIRE);
                }
                if (this.closestNPC instanceof Tree) {
                    this.achieveMilestone(Milestone.TALKED_TO_TREE);
                }
                if (this.closestNPC instanceof Stone) {
                    this.achieveMilestone(Milestone.TALKED_TO_STONE);
                }
                if (this.closestNPC instanceof FlameBoy) {
                    this.achieveMilestone(Milestone.TALKED_TO_FLAMEBOY);
                }
            } else if (this.canDanceToMakeRain()) {
                this.startDance(this.game.apocalypse ? 3 : 2);
                this.achieveMilestone(Milestone.MADE_RAIN);
            } else {
                if (this.carrying instanceof Stone) {
                    if (this.canThrowStoneIntoWater()) {
                        this.carrying.setVelocity(10 * this.direction, 10);
                        this.carrying = null;
                        this.throwingSound.stop();
                        this.throwingSound.play();
                    } else {
                        // TODO Say something when wrong place to throw
                    }
                } else if (this.carrying instanceof Seed) {
                    this.carrying.setVelocity(5 * this.direction, 5);
                    this.carrying = null;
                    this.throwingSound.stop();
                    this.throwingSound.play();
                } else if (this.carrying instanceof Wood) {
                    this.carrying.setVelocity(5 * this.direction, 5);
                    this.carrying = null;
                    this.throwingSound.stop();
                    this.throwingSound.play();
                }
            }
        } else if ((event.key === " " || event.key === "w" || event.key === "ArrowUp") && this.canJump()) {
            this.jumpKeyPressed = true;
            this.jump();
        } else if ((event.key === "s" || event.key === "ArrowDown")) {
            this.jumpDown = true;
        }

        if (this.game.dev) {
            if (event.key === "c") {
                // TODO Just for debugging. Real dancing is with action key on rain cloud
                this.startDance(3);
            } else if (event.key === "p" && !this.carrying) {
                // TODO Just for debugging, this must be removed later
                this.carry(this.game.stone);
            } else if (event.key === "o" && !this.carrying) {
                this.carry(this.game.tree.spawnSeed());
            } else if (event.key === "i" && !this.carrying) {
                this.carry(this.game.tree.seed.spawnWood());
            } else if (event.key === "t") {
                this.game.gameObjects.push(new Snowball(this.game, this.x, this.y + this.height * 0.75, 20 * this.direction, 10));
                this.throwingSound.stop();
                this.throwingSound.play();
            } else if (event.key === "k") {
                this.multiJump = true;
                this.doubleJump = true;
            }
        }
    }

    public async think(message: string, time: number): Promise<void> {
        if (this.thinkBubble) {
            this.thinkBubble.hide();
            this.thinkBubble = null;
        }
        const thinkBubble = this.thinkBubble = new SpeechBubble(this.game, this.x, this.y, "white", false)
        thinkBubble.setMessage(message);
        thinkBubble.show();
        await sleep(time);
        if (this.thinkBubble === thinkBubble) {
            thinkBubble.hide();
            this.thinkBubble = null;
        }
    }

    public startDance(difficulty: number = 1): void {
        if (!this.dance) {
            switch (difficulty) {
                case 1:
                    this.dance = new Dance(this.game, this.x, this.y - 25, 100, "  1 1 2 2 1 2 1 3", undefined,
                            1, undefined, true, 0);
                    break;
                case 2:
                    this.dance = new Dance(this.game, this.x, this.y - 25, 192, "1   2   1 1 2 2 121 212 121 212 3    ", undefined, 3);
                    break;
                case 3:
                    this.dance = new Dance(this.game, this.x, this.y - 25, 192, "112 221 312 123 2121121 111 222 3    ", undefined, 4);
                    break;
                default:
                    this.dance = new Dance(this.game, this.x, this.y - 25, 192, "3");
            }
        }
    }

    private canJump(): boolean {
        if (this.multiJump) {
            return true;
        } else if (this.doubleJump) {
            return !this.usedDoubleJump;
        }
        return !this.flying;
    }

    private jump(): void {
        this.setVelocityY(Math.sqrt(2 * PLAYER_JUMP_HEIGHT * GRAVITY));
        this.jumpingSounds[this.gender].stop();
        this.jumpingSounds[this.gender].play();
        if (this.flying) {
            this.usedDoubleJump = true;
            this.doubleJumpEmitter.setPosition(this.x, this.y + 20);
            this.doubleJumpEmitter.emit(20);
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
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }

        const legs = this.playerSprites[SpritePart.LEGS][this.legSpriteIndex];
        const body = this.playerSprites[SpritePart.BODY][this.bodySpriteIndex];
        const head = this.playerSprites[SpritePart.HEAD][this.hasBeard ? PlayerHeadSprite.MALE_BEARD : this.headSpriteIndex];

        legs.draw(ctx, this.spriteIndex);
        // const head = this.hasBeard ? this.beardedHeadSprite : this.headSprite;

        if (this.carrying) {
            if (this.spriteIndex === SpriteIndex.WALK2 || this.spriteIndex === SpriteIndex.WALK0) {
                body.draw(ctx, SpriteIndex.CARRY1);
                head.draw(ctx, SpriteIndex.CARRY1);
            } else {
                body.draw(ctx, SpriteIndex.CARRY0);
                head.draw(ctx, SpriteIndex.CARRY0);
            }
        } else {
            body.draw(ctx, this.spriteIndex);
            head.draw(ctx, this.spriteIndex);
        }
        ctx.restore();

        if (!this.isCarrying() && this.closestNPC && this.closestNPC.isReadyForConversation()
                && !this.playerConversation && !this.dance) {
            this.drawDialogTip(ctx);
        }

        if (this.canThrowStoneIntoWater()) {
            this.game.mainFont.drawTextWithOutline(ctx, "Press 'Enter' or 'E' to throw the stone into the water",
                this.x - Math.round(this.width / 2), -this.y + 12, "white", "black", 0.5);
        }

        if (this.canThrowSeedIntoSoil()) {
            this.game.mainFont.drawTextWithOutline(ctx, "Press 'Enter' or 'E' to throw the seed into the soil",
                this.x - Math.round(this.width / 2), -this.y + 12, "white", "black", 0.5);
        }

        if (this.canDanceToMakeRain()) {
            this.game.mainFont.drawTextWithOutline(ctx, "Press 'Enter' or 'E' to dance",
                this.x - Math.round(this.width / 2), -this.y + 12, "white", "black", 0.5);
        }

        if (this.dance) {
            this.dance.draw(ctx);
        }

        this.speechBubble.draw(ctx);
        if (this.thinkBubble) {
            this.thinkBubble.draw(ctx);
        }
    }

    private canThrowStoneIntoWater(): boolean {
        return this.carrying instanceof Stone && (this.direction === -1 &&
            this.game.world.collidesWith(this.x - 100, this.y - 20) === Environment.WATER);
    }

    private canThrowSeedIntoSoil(): boolean {
        return this.carrying instanceof Seed && (this.direction === -1 &&
            this.game.world.collidesWith(this.x - 30, this.y + 2) === Environment.SOIL);
    }

    private canDanceToMakeRain(): boolean {
        const ground = this.getGround();
        return !this.dance && !this.game.world.isRaining() && this.carrying === null &&
            (this.game.world.collidesWith(this.x, this.y - 5) === Environment.RAINCLOUD && !this.game.apocalypse ||
            ground instanceof Cloud && this.game.apocalypse && !ground.isRaining() && ground.canRain());
    }

    drawDialogTip(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        const text = this.dialogTipText;
        this.game.mainFont.drawTextWithOutline(ctx, text, this.x - Math.round(this.width / 2), -this.y + 12,
            "white", "black", 0.5);
        ctx.restore();
    }

    private respawn() {
        if (this.x > this.startX - 242) {
            this.x = this.startX;
            this.direction = -1;
        } else {
            this.x = this.startX - 485;
            this.direction = 1;
        }
        this.y = this.startY;
        this.setVelocity(0, 0);
    }

    update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
        if (this.thinkBubble) {
            this.thinkBubble.update(this.x, this.y);
        }
        if (this.playerConversation) {
            this.playerConversation.update(dt);
        }
        if ((Date.now() - this.lastHint) / 1000 > HINT_TIMEOUT) {
            this.showHint();
        }
        if (this.carrying) {
            this.carrying.x = this.x;
            this.carrying.y = this.y + this.height -
                ((this.spriteIndex === SpriteIndex.WALK2 || this.spriteIndex === SpriteIndex.WALK0) ? 1 : 0);
            if (this.carrying instanceof Seed) {
                this.carrying.x += 4;
            }
            if (this.carrying instanceof Stone) {
                this.carrying.direction = this.direction;
            }
        }

        const isDrowning = this.game.world.collidesWith(this.x, this.y) === Environment.WATER;
        if (isDrowning) {
            if (!this.thinkBubble) {
                const thought = drowningThoughts[rndInt(0, drowningThoughts.length)];
                this.think(thought.message, thought.duration);
            }
            if (this.carrying instanceof Stone) {
                this.carrying.setVelocity(-2, 10);
                this.carrying = null;
            }
            if (this.drowning === 0) {
                this.drowningSound.trigger();
            }
            this.setVelocityX(0);
            this.drowning += dt;
            if (this.drowning > 3) {
                this.drowningSound.stop();
                this.respawn();
                const thought = drownThoughts[rndInt(0, drownThoughts.length)];
                this.think(thought.message, thought.duration);
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
            this.usedDoubleJump = false;
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
                this.usedDoubleJump = false;
            }
        }

        if(wasFlying && !this.flying) {
            this.landingSound.stop();
            this.landingSound.play();
        }

        // check for npc in interactionRange
        const closestEntity = this.getClosestEntityInRange(this.game.fire.angry ? 1.8 * this.dialogRange : this.dialogRange);
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

        // Bounce
        if (this.game.world.collidesWith(this.x, this.y - 2, [ this ]) === Environment.BOUNCE) {
            this.bounce();
        }

        // Dance
        if (this.dance) {
            if (this.dance.hasStarted()) {
                // Basic dancing or error?
                const err = this.dance.getTimeSinceLastMistake(), suc = this.dance.getTimeSinceLastSuccess();
                if (err < 1 || suc < 3) {
                    if (err <= suc) {
                        if (err == 0) {
                            this.currentFailSpriteIndex = rnd() < 0.5 ? SpriteIndex.FAIL0 : SpriteIndex.FAIL1;
                        }
                        // Show error frame?
                        this.spriteIndex = getSpriteIndex(this.currentFailSpriteIndex, PLAYER_FAIL_ANIMATION);
                    } else {
                        // Show dance frame?
                        this.spriteIndex = getSpriteIndex(SpriteIndex.DANCE0, PLAYER_DANCING_ANIMATION);
                    }
                }
            }
            this.dance.setPosition(this.x, this.y - 16);
            const done = this.dance.update(dt);
            if (done) {
                // On cloud -> make it rain
                if (this.dance.wasSuccessful()) {
                    // (Useless because wrong cloud but hey...)
                    const ground = this.getGround();
                    if (ground && ground instanceof Cloud) {
                        ground.startRain(this.game.apocalypse ? Infinity : 15);
                    }
                    if (this.game.world.collidesWith(this.x, this.y - 5) === Environment.RAINCLOUD &&
                            !this.game.apocalypse) {
                        this.game.world.startRain();
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
        let pulled = 0, col = 0;
        if (this.getVelocityY() <= 0) {
            const world = this.game.world;
            const height = world.getHeight();
            col = world.collidesWith(this.x, this.y, [ this ],
                this.jumpDown ? [ Environment.PLATFORM, Environment.WATER ] : [ Environment.WATER ]);
            while (this.y < height && col) {
                pulled++;
                this.y++;
                col = world.collidesWith(this.x, this.y);
            }
        }
        return pulled;
    }

    private bounce(): void {
        this.setVelocityY(Math.sqrt(2 * PLAYER_BOUNCE_HEIGHT * GRAVITY));
        // Nice bouncy particles
        this.bounceEmitter.setPosition(this.x, this.y - 12);
        this.bounceEmitter.emit(20);
        this.dustEmitter.clear();
        this.bouncingSound.stop();
        this.bouncingSound.play();
    }

    public setBeard(beard: boolean) {
        this.hasBeard = beard;
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

    public carry(object: PhysicsEntity) {
        if (!this.carrying) {
            if (object instanceof Seed) {
                this.achieveMilestone(Milestone.GOT_SEED);
            }
            if (object instanceof Wood) {
                this.achieveMilestone(Milestone.GOT_WOOD);
            }
            if (object instanceof Stone) {
                this.achieveMilestone(Milestone.GOT_STONE);
            }
            this.carrying = object;
            object.setFloating(false);
            if (object instanceof Stone) {
                object.state = StoneState.DEFAULT;
            }
            if (object instanceof Seed) {
                object.state = SeedState.FREE;
            }
            if (object instanceof Wood) {
                object.state = WoodState.FREE;
            }
            object.x = this.x;
            object.y = this.y + this.height;
            object.setVelocity(0, 0);
        }
    }

    public isCarrying(object?: PhysicsEntity): boolean {
        if (object) {
            return this.carrying === object;
        } else {
            return this.carrying != null;
        }
    }

    public achieveMilestone(milestone: Milestone): void {
        this.milestone = Math.max(this.milestone, milestone);
        this.lastHint = Date.now();
    }

    public showHint(): void {
        if (this.playerConversation === null) {
            switch (this.milestone) {
                case Milestone.JUST_ARRIVED:
                    this.think("I should talk to someone.", 3000);
                    break;
                case Milestone.TALKED_TO_FIRE:
                    this.think("The fire told me to visit the tree in the east", 3000);
                    break;
                case Milestone.TALKED_TO_TREE:
                    this.think("Maybe I should talk to the tree again", 3000);
                    break;
                case Milestone.GOT_SEED:
                    this.think("I should check the mountains for a good place for the seed", 3000);
                    break;
                case Milestone.PLANTED_SEED:
                    this.think("The seed needs something to grow, I think", 3000);
                    break;
                case Milestone.TALKED_TO_STONE:
                    this.think("I should talk to that crazy stone again", 3000);
                    break;
                case Milestone.GOT_STONE:
                    this.think("My arms get heavy. I really should throw that thing in the river", 3000);
                    break;
                case Milestone.THROWN_STONE_INTO_WATER:
                    this.think("There must be something interesting west of the river", 3000);
                    break;
                case Milestone.TALKED_TO_FLAMEBOY:
                    this.think("I should check the clouds. The seed still needs something to grow", 3000);
                    break;
                case Milestone.MADE_RAIN:
                    this.think("I should talk to that singing tree again", 3000);
                    break;
                case Milestone.GOT_WOOD:
                    this.think("Quick! The fire needs wood!", 3000);
                    break;
            }
        }
        this.lastHint = Date.now();
    }
}
