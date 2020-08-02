import { SpeechBubble } from "./SpeechBubble";
import {
    DIALOG_FONT, GRAVITY, MAX_PLAYER_SPEED, PLAYER_ACCELERATION, PLAYER_JUMP_HEIGHT,
    PLAYER_BOUNCE_HEIGHT, PLAYER_ACCELERATION_AIR, SHORT_JUMP_GRAVITY, MAX_PLAYER_RUNNING_SPEED,
    PLAYER_JUMP_TIMING_THRESHOLD, DOUBLE_JUMP_COLORS, PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_CARRY_PADDING
} from "./constants";
import { NPC } from './NPC';
import { PhysicsEntity } from "./PhysicsEntity";
import { Snowball } from "./Snowball";
import { Environment } from "./World";
import { particles, valueCurves, ParticleEmitter } from './Particles';
import { rnd, rndItem, timedRnd, sleep, rndInt, isDev, boundsFromMapObject } from './util';
import { entity, Bounds } from "./Entity";
import { Sound } from "./Sound";
import { Dance } from './Dance';
import { Stone, StoneState } from "./Stone";
import { Cloud } from './Cloud';
import { Seed, SeedState } from "./Seed";
import { PlayerConversation } from './PlayerConversation';
import { Wood, WoodState } from "./Wood";
import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { BitmapFont } from "./BitmapFont";
import { GameScene, FadeDirection, BgmId } from "./scenes/GameScene";
import { GotItemScene, Item } from './scenes/GotItemScene';
import { Conversation } from './Conversation';
import { ControllerFamily } from "./input/ControllerFamily";
import { ControllerEvent } from './input/ControllerEvent';
import { QuestATrigger, QuestKey } from './Quests';
import { GameObjectInfo } from './MapInfo';
import { Sign } from './Sign';
import { Wall } from './Wall';

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

const genderSwapColors = [
    "#ef002d",
    "#a900ef",
    "#0049ef",
    "#00e7ef",
    "#00ef33",
    "#bfef00",
    "#ef8d00",
];

const drownThoughts = [
    { message: "Ok, I'm not Jesus. Noted!", duration: 4000 },
    { message: "Looks like I can't swim… But I can respawn, nice!", duration: 5000 },
    { message: "Well, that was strange… And wet.", duration: 4000 }
];

const drowningThoughts = [
    { message: "Waah!", duration: 1000 },
    { message: "Help!", duration: 1000 },
    { message: "Mama!", duration: 1000 },
    { message: "Ieeh!", duration: 1000 },
    { message: "Argh!", duration: 1000 }
];

export enum Gender {
    FEMALE = 0,
    MALE = 1
};

/** The number of seconds until player gets a hint. */
const HINT_TIMEOUT = 90;

const startingGender = Math.random() >= 0.5 ? Gender.MALE : Gender.FEMALE;
Conversation.setGlobal("ismale", startingGender === Gender.MALE ? "true" : "false");

interface PlayerSpriteMetadata {
    carryOffsetFrames?: number[];
}

type AutoMove = {
    destinationX: number;
    lastX: number;
    turnAround: boolean;
}

@entity("player")
export class Player extends PhysicsEntity {
    @asset([
        "sprites/pc/female.aseprite.json",
        "sprites/pc/male.aseprite.json"
    ])
    public static playerSprites: Aseprite[];

    @asset("sprites/buttons.aseprite.json")
    public static buttons: Aseprite;

    @asset("sounds/drowning/drowning.mp3")
    private static drowningSound: Sound;

    @asset("sounds/feet-walking/steps_single.mp3")
    private static walkingSound: Sound;

    @asset("sounds/throwing/throwing.mp3")
    private static throwingSound: Sound;

    @asset("sounds/genderswapping/fairydust.mp3")
    private static genderSwapSound: Sound;

    @asset("sounds/gate/door_open.mp3")
    private static enterGateSound: Sound;

    @asset("sounds/gate/door_close.mp3")
    private static leaveGateSound: Sound;

    @asset([
        "sounds/jumping/jumping_female.mp3",
        "sounds/jumping/jumping.mp3"
    ])
    private static jumpingSounds: Sound[];

    @asset("sounds/jumping/landing.mp3")
    private static landingSound: Sound;

    @asset("sounds/jumping/squish.mp3")
    private static bouncingSound: Sound;

    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    private lastHint = Date.now();
    private flying = false;
    private gender = startingGender;
    public direction = 1;
    private playerSpriteMetadata: PlayerSpriteMetadata[] | null = null;
    public animation = "idle";
    private moveLeft: boolean = false;
    private moveRight: boolean = false;
    private visible = false;

    private doubleTapThreshold = 0.5;
    private doubleTapTimestamp = 0;
    private running: boolean = false;

    private jumpThresholdTimer = PLAYER_JUMP_TIMING_THRESHOLD;

    public jumpDown: boolean = false;
    private jumpKeyPressed: boolean | null = false;
    private drowning = 0;
    private dance: Dance | null = null;
    private currentFailAnimation = 1;
    private carrying: PhysicsEntity | null = null;
    private canRun = false;
    private canRainDance = false;
    private doubleJump = false;
    private multiJump = false;
    private usedJump = false;
    private usedDoubleJump = false;
    private hasBeard = false;
    private autoMove: AutoMove | null = null;
    private isControllable: boolean = true;
    private showHints = false;

    public playerConversation: PlayerConversation | null = null;
    public speechBubble = new SpeechBubble(
        this.scene, this.x, this.y, undefined, undefined, undefined, undefined, true
    );
    public thinkBubble: SpeechBubble | null = null;

    private closestNPC: NPC | null = null;
    private readableTrigger?: GameObjectInfo;
    private dustEmitter: ParticleEmitter;
    private bounceEmitter: ParticleEmitter;
    private doubleJumpEmitter: ParticleEmitter;
    private genderSwapEmitter: ParticleEmitter;
    private disableParticles = false;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
        this.isControllable = false;
        this.setFloating(true);

        setTimeout(() => {
            this.isControllable = true;
            this.visible = true;
            this.setFloating(false);
        }, 2200);

        document.addEventListener("keydown", event => this.handleKeyDown(event));

        if (isDev()) {
            console.log("Dev mode, press C to dance anywhere, P to spawn the stone, O to spawn the seed, I to spawn " +
                "wood, T to throw useless snowball, K to learn all abilities, M to show bounds of Entities and Triggers");
        }
        this.setMaxVelocity(MAX_PLAYER_RUNNING_SPEED);
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
            color: () => rndItem(DOUBLE_JUMP_COLORS),
            size: rnd(1.5, 3),
            gravity: {x: 0, y: -120},
            lifetime: () => rnd(0.4, 0.6),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });
        this.genderSwapEmitter = particles.createEmitter({
            position: {x: this.x, y: this.y},
            velocity: () => ({ x: rnd(-1, 1) * 45, y: rnd(-1, 1) * 45 }),
            color: () => rndItem(genderSwapColors),
            size: rnd(2, 2),
            gravity: {x: 0, y: 0},
            lifetime: () => rnd(0.5, 1),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });
    }

    public toggleGender () {
        this.genderSwapEmitter.setPosition(this.x, this.y + Player.playerSprites[this.gender].height / 2);
        this.genderSwapEmitter.emit(20);
        Player.genderSwapSound.play();
        this.gender = this.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;
        Conversation.setGlobal("ismale", this.gender === Gender.MALE ? "true" : "" );
    }

    public startAutoMove (x: number, turnAround: boolean) {
        if (!this.autoMove) {
            this.isControllable = false;
            this.autoMove = {
                destinationX: x,
                lastX: this.x,
                turnAround
            };
        }
        // Failsafe to stop automove after 1 second.
        setTimeout(() => {
            if (this.autoMove) this.stopAutoMove();
        }, 1000);
    }

    public stopAutoMove (): void {
        if (this.autoMove?.turnAround) {
            this.direction = this.direction * -1;
        }
        this.autoMove = null;
        this.moveRight = false;
        this.moveLeft = false;
        this.isControllable = true;
    }

    public enableRunning (): void {
        this.scene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.GOT_RUNNING_ABILITY);
        if (!this.canRun) {
            this.scene.scenes.pushScene(GotItemScene, { item: Item.RUNNING });
            this.canRun = true;
        }
    }

    public enableRainDance (): void {
        this.scene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.LEARNED_RAIN_DANCE);
        if (!this.canRainDance) {
            this.scene.scenes.pushScene(GotItemScene, { item: Item.RAINDANCE });
            this.canRainDance = true;
        }
    }

    public enableDoubleJump (): void {
        this.scene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.GOT_QUEST_FROM_TREE);
        if (!this.doubleJump) {
            this.scene.scenes.pushScene(GotItemScene, { item: Item.DOUBLEJUMP });
            this.doubleJump = true;
        }
    }

    public enableMultiJump (): void {
        this.scene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.GOT_MULTIJUMP);
        if (!this.multiJump) {
            this.scene.scenes.pushScene(GotItemScene, { item: Item.MULTIJUMP });
            this.multiJump = true;
        }
    }

    public removePowerUps (): void {
        this.multiJump = false;
        this.doubleJump = false;
        this.canRun = false;
    }

    public getDance (): Dance | null {
        return this.dance;
    }

    public cancelDance (): void {
        this.dance = null;
    }

    private handleRunningCheck (direction: number): void {
        if (!this.canRun) return;

        if (this.carrying) {
            this.running = false;
            return;
        }
        if (this.direction === direction) {
            if (this.scene.gameTime <= this.doubleTapTimestamp + this.doubleTapThreshold) {
                this.running = true;
            } else {
                this.doubleTapTimestamp = this.scene.gameTime;
            }
        } else {
            this.doubleTapTimestamp = this.scene.gameTime;
            this.running = false;
        }
    }

    public async handleButtonDown(event: ControllerEvent) {
        if (this.scene.paused || !this.isControllable || this.autoMove) {
            return;
        }
        if (this.dance) {
            this.dance.handleButtonDown(event);
            return;
        }
        if (!this.scene.camera.isOnTarget() || event.repeat) {
            return;
        }
        if (this.playerConversation) {
            this.playerConversation.handleButton(event);
            return;
        }

        if (event.isPlayerMoveRight) {
            this.moveRight = true;
            this.moveLeft = false;
            this.handleRunningCheck(1);
        } else if (event.isPlayerMoveLeft) {
            this.moveLeft = true;
            this.moveRight = false;
            this.handleRunningCheck(-1);
        } else if (event.isPlayerInteract) {
            // Check for gates / doors
            if (!this.flying) {
                const gate = this.scene.world.getGateCollisions(this)[0];
                if (gate && !this.carrying) {
                    this.enterGate(gate);
                    return;
                } else {
                    if (this.closestNPC && this.closestNPC.isReadyForConversation() && this.closestNPC.conversation) {
                        const conversation = this.closestNPC.conversation;
                        // Disable auto movement to a safe talking distance for the stone in the river
                        const autoMove = this.closestNPC instanceof Sign || (this.closestNPC instanceof Stone && this.closestNPC.state !== StoneState.DEFAULT) ? false : true;
                        this.playerConversation = new PlayerConversation(this, this.closestNPC, conversation, autoMove);
                    } else if (this.readableTrigger) {
                        const content = this.readableTrigger.properties.content || 'Nothing...';
                        const duration = this.readableTrigger.properties.duration ? this.readableTrigger.properties.duration * 1000 : 3000
                        this.think(content, duration);
                    } else if (this.canDanceToMakeRain()) {
                        this.startDance(this.scene.apocalypse ? 3 : 2);
                        this.scene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.MADE_RAIN);
                    }
                }
            }
        } else if (event.isPlayerAction) {
            if (this.isCarrying()) this.throw();
        } else if (event.isPlayerJump && this.canJump()) {
            this.jumpKeyPressed = true;
            this.jump();
        } else if (event.isPlayerDrop) {
            this.jumpDown = true;
        }
    }

    public throw (): void {
        if (!this.carrying || (this.carrying instanceof Stone && !this.canThrowStoneIntoWater())) {
            return;
        }

        if (this.carrying instanceof Stone) {
            this.carrying.setVelocity(10 * this.direction, 10);
        } else {
            this.carrying.setVelocity(5 * this.direction, 5);
        }

        this.height = PLAYER_HEIGHT;
        this.carrying = null;
        Player.throwingSound.stop();
        Player.throwingSound.play();
    }

    // Used in dev mode to enable some special keys that can only be triggered
    // by using a keyboard.
    public handleKeyDown(event: KeyboardEvent): void {
        if (this.scene.paused) {
            return;
        }
        if (!this.scene.camera.isOnTarget() || event.repeat) {
            return;
        }

        if (isDev()) {
            if (event.key === "c") {
                // TODO Just for debugging. Real dancing is with action key on rain cloud
                this.startDance(3);
            } else if (event.key === "p" && !this.carrying) {
                // TODO Just for debugging, this must be removed later
                this.carry(this.scene.stone);
            } else if (event.key === "o" && !this.carrying) {
                this.carry(this.scene.tree.spawnSeed());
            } else if (event.key === "i" && !this.carrying) {
                this.carry(this.scene.tree.seed.spawnWood());
            } else if (event.key === "t") {
                this.scene.gameObjects.push(new Snowball(this.scene, this.x, this.y + this.height * 0.75, 20 * this.direction, 10));
                Player.throwingSound.stop();
                Player.throwingSound.play();
            } else if (event.key === "k") {
                this.multiJump = true;
                this.doubleJump = true;
            } else if (event.key === "m") {
                this.scene.showBounds = !this.scene.showBounds;
            }
        }
    }

    public async think(message: string, time: number): Promise<void> {
        if (this.thinkBubble) {
            this.thinkBubble.hide();
            this.thinkBubble = null;
        }
        const thinkBubble = this.thinkBubble = new SpeechBubble(this.scene, this.x, this.y)
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
                    this.dance = new Dance(this.scene, this.x, this.y - 25, 100, "  1 1 2 2 1 2 1 3", undefined,
                            1, undefined, true, 0);
                    break;
                case 2:
                    this.dance = new Dance(this.scene, this.x, this.y - 25, 192, "1   2   1 1 2 2 121 212 121 212 3    ", undefined, 3);
                    break;
                case 3:
                    this.dance = new Dance(this.scene, this.x, this.y - 25, 192, "112 221 312 123 2121121 111 222 3    ", undefined, 4);
                    break;
                default:
                    this.dance = new Dance(this.scene, this.x, this.y - 25, 192, "3");
            }
        }
    }

    /**
     * Teleport the player fromt he source gate to it's corresponding target gate.
     * The teleport is not instand but accompanied by a fade to black to obscure the teleportation.
     * Also sets the camera bounds to the target position
     * @param gate the source the player enters
     */
    private enterGate(gate: GameObjectInfo): void {
        if (gate && gate.properties.target) {
            this.isControllable = false;
            this.moveRight = false;
            this.moveLeft = false;
            const targetGate = this.scene.gateObjects.find(target => target.name === gate.properties.target);
            const targetBgmId = gate.properties.bgm;

            if (targetGate) {
                Player.enterGateSound.stop();
                Player.enterGateSound.play();
                this.scene.fadeToBlack(0.8, FadeDirection.FADE_OUT)
                .then(() => {
                    if (targetBgmId) this.scene.setActiveBgmTrack(targetBgmId as BgmId);
                    Player.leaveGateSound.stop();
                    Player.leaveGateSound.play();
                    this.x = targetGate.x + (targetGate.width / 2);
                    this.y = targetGate.y - targetGate.height;
                    this.scene.camera.setBounds(this.getCurrentMapBounds())
                    this.scene.fadeToBlack(0.8, FadeDirection.FADE_IN).then(() => {
                        this.isControllable = true;
                    });
                });
            }
        }
    }

    private canJump(): boolean {
        if (this.multiJump) {
            return true;
        } else if (!this.usedJump && this.jumpThresholdTimer > 0) {
            return true;
        } else if (this.doubleJump) {
            return !this.usedDoubleJump;
        }
        return !this.flying;
    }

    private jump(): void {
        this.setVelocityY(Math.sqrt(2 * PLAYER_JUMP_HEIGHT * GRAVITY));
        Player.jumpingSounds[this.gender].stop();
        Player.jumpingSounds[this.gender].play();

        if (this.flying && this.usedJump) {
            this.usedDoubleJump = true;
            if (!this.disableParticles && this.visible) {
                this.doubleJumpEmitter.setPosition(this.x, this.y + 20);
                this.doubleJumpEmitter.emit(20);
            }
        }
        this.usedJump = true;
    }

    public handleButtonUp(event: ControllerEvent) {
        if (this.scene.paused || !this.isControllable || this.autoMove) {
            return;
        }
        if (event.isPlayerMoveRight) {
            this.moveRight = false;
            this.running = false;
        } else if (event.isPlayerMoveLeft) {
            this.moveLeft = false;
            this.running = false;
        } else if (event.isPlayerJump) {
            this.jumpKeyPressed = false;
        } else if (event.isPlayerDrop) {
            this.jumpDown = false;
        }
    }

    private drawTooltip (
        ctx: CanvasRenderingContext2D, text: string, buttonTag = "action",
        controller: ControllerFamily = this.scene.game.currentControllerFamily
    ) {
        const measure = Player.font.measureText(text);
        const gap = 6;
        const offsetY = 12;
        const textPositionX = Math.round(this.x - ((measure.width - Player.buttons.width + gap) / 2));
        const textPositionY = -this.y + offsetY;
        Player.buttons.drawTag(ctx, controller + "-" + buttonTag, textPositionX - Player.buttons.width - gap, textPositionY);
        Player.font.drawTextWithOutline(ctx, text, textPositionX, textPositionY,
            "white", "black");
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) return;
        ctx.save();
        ctx.beginPath();

        ctx.translate(this.x, -this.y + 1);
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }

        const sprite = Player.playerSprites[this.gender];
        let animation = this.animation;
        if (this.carrying && (animation === "idle" || animation === "walk" || animation === "jump" || animation === "fall")) {
            animation = animation + "-carry";
        }
        if (this.hasBeard) {
            // TODO
        }
        sprite.drawTag(ctx, animation, -sprite.width >> 1, -sprite.height, this.scene.gameTime * 1000);

        ctx.restore();

        if (this.scene.showBounds) this.drawBounds(ctx);

        if (this.closestNPC && !this.dance && !this.playerConversation && this.closestNPC.isReadyForConversation()) {
            this.drawTooltip(ctx, this.closestNPC.getInteractionText(), "up");
        } else if (this.readableTrigger) {
            this.drawTooltip(ctx, "Examine", "up");
        } else if (this.canEnterDoor()) {
            this.drawTooltip(ctx, "Enter", "up");
        } else if (this.canThrowStoneIntoWater()) {
            this.drawTooltip(ctx, "Throw stone", "interact");
        } else if (this.canThrowSeedIntoSoil()) {
            this.drawTooltip(ctx, "Plant seed", "interact");
        } else if (this.canDanceToMakeRain()) {
            this.drawTooltip(ctx, "Dance", "up");
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
            this.scene.world.collidesWith(this.x - 30, this.y - 20) === Environment.WATER);
    }

    private canThrowSeedIntoSoil(): boolean {
        return this.carrying instanceof Seed && (this.direction === -1 &&
            this.scene.world.collidesWith(this.x - 30, this.y + 2) === Environment.SOIL);
    }

    public debugCollisions(): void {
        console.log('Entities: ',this.scene.world.getEntityCollisions(this));
        console.log('Triggers: ',this.scene.world.getTriggerCollisions(this));
        console.log('Gates: ',this.scene.world.getGateCollisions(this));
    }

    private getReadableTrigger (): GameObjectInfo | undefined {
        const triggers = this.scene.world.getTriggerCollisions(this);
        if (triggers.length === 0) return undefined;
        return triggers.find(t => t.name === 'readable');
    }

    private canDanceToMakeRain(): boolean {
        // if (!this.scene.game.campaign.getQuest(QuestKey.A).isTriggered(QuestATrigger.LEARNED_RAIN_DANCE)) return false;
        if (!this.canRainDance) return false;
        const ground = this.getGround();
        return (
            (this.isCollidingWithTrigger('raincloud_sky') &&
            !this.scene.world.isRaining() &&
            this.carrying === null &&
            !this.scene.apocalypse) ||
            (ground instanceof Cloud && this.scene.apocalypse && !ground.isRaining() && ground.canRain())
        );
    }

    private canEnterDoor(): boolean {
        return !this.flying && !this.carrying && this.scene.world.getGateCollisions(this).length > 0;
    }

    public getCurrentMapBounds (): Bounds | undefined {
        const collisions = this.scene.world.getCameraBounds(this);
        if (collisions.length === 0) return undefined;
        return boundsFromMapObject(collisions[0]);
    }

    private respawn() {
        this.x = this.lastGroundPosition.x;
        this.y = this.lastGroundPosition.y + 10;
        this.setVelocity(0, 0);
    }

    private getPlayerSpriteMetadata(): PlayerSpriteMetadata[] {
        if (this.playerSpriteMetadata == null) {
            this.playerSpriteMetadata = Player.playerSprites.map(sprite => {
                const metaDataJSON = sprite.getLayer("Meta")?.data;
                return metaDataJSON ? JSON.parse(metaDataJSON): {};
            });
        };
        return this.playerSpriteMetadata;
    }

    private resetJumps (): void {
        this.usedJump = false;
        this.usedDoubleJump = false;
        this.jumpThresholdTimer = PLAYER_JUMP_TIMING_THRESHOLD;
    }

    update(dt: number): void {
        super.update(dt);
        const triggerCollisions = this.scene.world.getTriggerCollisions(this);

        this.speechBubble.update(this.x, this.y);
        if (this.thinkBubble) {
            this.thinkBubble.update(this.x, this.y);
        }
        if (this.playerConversation) {
            this.playerConversation.update(dt);
        }
        if (this.showHints) {
            if ((Date.now() - this.lastHint) / 1000 > HINT_TIMEOUT) {
                this.showHint();
            }
        }
        if (this.carrying) {
            if (this.running) {
                this.running = false;
                this.animation = 'walk';
            }
            this.carrying.x = this.x;
            const currentFrameIndex = Player.playerSprites[this.gender].getTaggedFrameIndex(this.animation + "-carry",
                this.scene.gameTime * 1000);
            const carryOffsetFrames = this.getPlayerSpriteMetadata()[this.gender].carryOffsetFrames ?? [];
            const offset = carryOffsetFrames.includes(currentFrameIndex + 1) ? 0 : -1;
            this.carrying.y = this.y + (this.height - PLAYER_CARRY_PADDING) - offset + 4;
            if (this.carrying instanceof Stone) {
                this.carrying.direction = this.direction;
            }
        }

        const isDrowning = this.scene.world.collidesWith(this.x, this.y) === Environment.WATER;
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
                Player.drowningSound.play();
            }
            this.setVelocityX(0);
            this.drowning += dt;
            if (this.drowning > 3) {
                Player.drowningSound.stop();
                this.respawn();
                const thought = drownThoughts[rndInt(0, drownThoughts.length)];
                this.think(thought.message, thought.duration);
            }
        } else {
            this.drowning = 0;
        }

        const world = this.scene.world;
        const wasFlying = this.flying;
        const prevVelocity = this.getVelocityY();

        // Apply auto movement
        if (this.autoMove) {
            if ((this.autoMove.lastX - this.autoMove.destinationX) * (this.x - this.autoMove.destinationX) <= 0 ) {
                // Reached or overreached destination
                this.stopAutoMove();
            } else {
                // Not yet reached, keep going
                this.autoMove.lastX = this.x;
                if (this.x < this.autoMove.destinationX) {
                    this.moveRight = true;
                    this.moveLeft = false;
                } else {
                    this.moveRight = false;
                    this.moveLeft = true;
                }
            }
        }

        // Player movement
        if (!this.scene.camera.isOnTarget()) {
            this.moveRight = false;
            this.moveLeft = false;
        }
        const acceleration = this.flying ? PLAYER_ACCELERATION_AIR : PLAYER_ACCELERATION;
        if (!isDrowning) {
            if(this.running) {
                this.setMaxVelocity(MAX_PLAYER_RUNNING_SPEED)
            } else {
                this.setMaxVelocity(MAX_PLAYER_SPEED)
            }
            if (this.moveRight) {
                this.direction = 1;
                if (!this.flying) {
                    Player.walkingSound.play();
                }
                this.accelerateX(acceleration * dt);
            } else if (this.moveLeft) {
                this.direction = -1;
                if (!this.flying) {
                    Player.walkingSound.play();
                }
                this.accelerateX(-acceleration * dt);
            } else {
                Player.walkingSound.stop();
                if (this.getVelocityX() > 0) {
                    this.decelerateX(acceleration * dt);
                } else {
                    this.decelerateX(-acceleration * dt);
                }
            }
        }

        // Set sprite index depending on movement
        if (this.getVelocityX() === 0 && this.getVelocityY() === 0) {
            this.animation = "idle";
            this.flying = false;
            this.resetJumps();
        } else {
            if (this.getVelocityY() > 0) {
                this.animation = "jump";
                this.flying = true;
            } else if (isDrowning || (this.getVelocityY() < 0 && this.y - world.getGround(this.x, this.y) > 10)) {
                if (this.jumpThresholdTimer < 0 || this.usedJump) {
                    this.animation = "fall";
                }
                this.flying = true;
            } else {
                this.animation = (this.running && !this.carrying) ? "run" : "walk";
                this.flying = false;
                this.resetJumps();
            }
        }

        if (wasFlying && !this.flying) {
            Player.landingSound.stop();
            Player.landingSound.play();
        }

        // Reduce jump threshold timer when player did not jump yet when falling off an edge
        if (this.flying && !this.usedJump && this.jumpThresholdTimer > 0) {
            this.jumpThresholdTimer -= dt;
        }

        // Check for NPC's that can be interacted with
        // Reset closestNPC and get all entities that collide with the player with an added 5px of margin
        // If there are multiple npcs colliding, the closest one will be chosen
        this.closestNPC = null;
        const entities = this.scene.world.getEntityCollisions(this, 5);
        if (entities.length > 0) {
            const closestEntity = entities.length > 1 ? this.getClosestEntity(entities) : entities[0];
            if (closestEntity instanceof NPC) {
                this.closestNPC = closestEntity;
            }
        }

        // Check for readables in player trigger collisions
        this.readableTrigger = this.getReadableTrigger();

        // Spawn random dust particles while walking
        if (!this.disableParticles && this.visible) {
            if (!this.flying && (Math.abs(this.getVelocityX()) > 1 || wasFlying)) {
                if (timedRnd(dt, 0.2) || wasFlying) {
                    this.dustEmitter.setPosition(this.x, this.y);
                    const count = wasFlying ? Math.ceil(Math.abs(prevVelocity) / 5) : 1;
                    this.dustEmitter.emit(count);
                }
            }
        }

        // Reset jump key state when on ground
        if (!this.flying && this.jumpKeyPressed != null) {
            this.jumpKeyPressed = null;
        }

        // Bounce
        if (this.scene.world.collidesWith(this.x, this.y - 2, [ this ]) === Environment.BOUNCE) {
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
                            this.currentFailAnimation = rndInt(1, 3);
                        }
                        this.animation = "dance-fluke-" + this.currentFailAnimation;
                    } else {
                        this.animation = "dance";
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
                        ground.startRain(this.scene.apocalypse ? Infinity : 15);

                        // Camera focus to boss for each triggered rain cloud
                        const bossPointer = this.scene.pointsOfInterest.find(poi => poi.name === 'boss_spawn');
                        if (bossPointer) {
                            this.scene.camera.focusOn(3, bossPointer.x, bossPointer.y + 60, 1, 0, valueCurves.cos(0.35));
                        }

                        // Remove a single boss fight barrier
                        const rainingCloudCount = this.scene.gameObjects.filter(o => o instanceof Cloud && o.isRaining()).length;
                        const wallIdentifier = `wall${rainingCloudCount - 1}`;
                        const targetWall = this.scene.gameObjects.find(o => o instanceof Wall && o.identifier === wallIdentifier) as Wall | undefined;
                        if (targetWall) {
                            targetWall.crumble()
                        }
                    }
                    if (this.isCollidingWithTrigger('raincloud_sky')) {
                        this.scene.world.startRain();
                    }
                }
                this.dance = null;
            }
        }

        this.disableParticles = false;

        // Logic from Triggers
        if (triggerCollisions.length > 0) {
            triggerCollisions.forEach(trigger => {

                // Handle Mountain Riddle Logic
                if (trigger.name === 'reset_mountain') {
                    this.scene.mountainRiddle.resetRiddle();
                }
                if (trigger.name === 'mountaingate') {
                    const row = trigger.properties.row;
                    const col = trigger.properties.col;
                    if (col != null && row != null) {
                        this.scene.mountainRiddle.checkGate(col, row);
                    }
                }
                if (trigger.name === 'teleporter' && this.scene.mountainRiddle.isFailed() && !this.scene.mountainRiddle.isCleared()) {
                    const teleportY = trigger.properties.teleportY;
                    if (teleportY) {
                        this.y -= teleportY;
                    }
                }
                if (trigger.name === 'finish_mountain_riddle') {
                    this.scene.mountainRiddle.clearRiddle();
                }

                // Disable particle effects while in trigger
                const disableParticles = trigger.properties.disableParticles;
                if (disableParticles) {
                    this.disableParticles = true;
                }

                // Set Global Conversation Variables from map triggers
                const globalConversationProps = {
                    key: trigger.properties.setGlobalKey,
                    value: trigger.properties.setGlobalVal
                }
                if (globalConversationProps.key && globalConversationProps.value) {
                    Conversation.setGlobal(globalConversationProps.key, globalConversationProps.value);
                }

                // Enable Conversion Trees from map triggers
                const enableConversationProps = {
                    key: trigger.properties.setDialogEntity,
                    value: trigger.properties.setDialogValue
                }
                if (enableConversationProps.key && enableConversationProps.value) {
                    this.scene.game.campaign.runAction("enable", null, [enableConversationProps.key, enableConversationProps.value]);
                }
            })
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
            const world = this.scene.world;
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
        Player.bouncingSound.stop();
        Player.bouncingSound.play();
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
        const world = this.scene.world;
        while (this.y > 0 && world.collidesWith(this.x, this.y + this.height, [ this ],
                [ Environment.PLATFORM, Environment.WATER ])) {
            pulled++;
            this.y--;
        }
        return pulled;
    }

    private pullOutOfWall(): number {
        let pulled = 0;
        const world = this.scene.world;
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
            this.height = PLAYER_HEIGHT + PLAYER_CARRY_PADDING;
            if (object instanceof Seed && this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.GOT_SEED) {
                this.scene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.GOT_SEED);
            }
            if (object instanceof Wood && this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.GOT_WOOD) {
                this.scene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.GOT_WOOD);
                this.scene.game.campaign.runAction("enable", null, ["fire", "fire1"]);
            }
            if (object instanceof Stone && this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.GOT_STONE) {
                this.scene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.GOT_STONE);
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

    // this.lastHint = Date.now();

    public showHint(): void {
        if (this.playerConversation === null) {
            switch (this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex()) {
                case QuestATrigger.JUST_ARRIVED:
                    this.think("I should talk to someone.", 3000);
                    break;
                case QuestATrigger.TALKED_TO_FIRE:
                    this.think("I think the fire needs my help.", 3000);
                    break;
                case QuestATrigger.GOT_QUEST_FROM_FIRE:
                    this.think("The fire told me to visit the tree in the east.", 3000);
                    break;
                case QuestATrigger.TALKED_TO_TREE:
                    this.think("Maybe I should talk to the tree again.", 3000);
                    break;
                case QuestATrigger.GOT_QUEST_FROM_TREE:
                    this.think("I need to pick up the seed by the tree.", 3000);
                    break;
                case QuestATrigger.GOT_SEED:
                    this.think("I should check the mountains for a good place for the seed.", 3000);
                    break;
                case QuestATrigger.PLANTED_SEED:
                    this.think("The seed needs something to grow, I think.", 3000);
                    break;
                case QuestATrigger.TALKED_TO_STONE:
                    this.think("I should talk to that crazy stone again.", 3000);
                    break;
                case QuestATrigger.GOT_STONE:
                    this.think("My arms get heavy. I really should throw that thing in the river.", 3000);
                    break;
                case QuestATrigger.THROWN_STONE_INTO_WATER:
                    this.think("There must be something interesting west of the river.", 3000);
                    break;
                case QuestATrigger.GOT_MULTIJUMP:
                    this.think("I should check the clouds. The seed still needs something to grow.", 3000);
                    break;
                case QuestATrigger.MADE_RAIN:
                    this.think("I should talk to that singing tree again.", 3000);
                    break;
                case QuestATrigger.GOT_WOOD:
                    this.think("Quick! The fire needs wood!", 3000);
                    break;
            }
        }
        this.lastHint = Date.now();
    }
}
