import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { BgmId, FadeDirection, GameScene } from './scenes/GameScene';
import { BitmapFont } from './BitmapFont';
import { Bounds, entity } from './Entity';
import { boundsFromMapObject, isDev, rnd, rndInt, rndItem, sleep, timedRnd } from './util';
import { Cloud } from './Cloud';
import { ControllerAnimationTags, ControllerSpriteMap } from './input/ControllerFamily';
import { ControllerEvent } from './input/ControllerEvent';
import { ControllerManager } from './input/ControllerManager';
import { Conversation } from './Conversation';
import { ConversationProxy } from './ConversationProxy';
import { Dance } from './Dance';
import {
    DIALOG_FONT, DOUBLE_JUMP_COLORS, GRAVITY, MAX_PLAYER_RUNNING_SPEED, MAX_PLAYER_SPEED,
    PLAYER_ACCELERATION, PLAYER_ACCELERATION_AIR, PLAYER_BOUNCE_HEIGHT, PLAYER_CARRY_HEIGHT,
    PLAYER_HEIGHT, PLAYER_JUMP_HEIGHT, PLAYER_JUMP_TIMING_THRESHOLD, PLAYER_WIDTH,
    SHORT_JUMP_GRAVITY
} from './constants';
import { Environment } from './World';
import { GameObjectInfo } from './MapInfo';
import { GotItemScene, Item } from './scenes/GotItemScene';
import { NPC } from './NPC';
import { ParticleEmitter, valueCurves } from './Particles';
import { PhysicsEntity } from './PhysicsEntity';
import { PlayerConversation } from './PlayerConversation';
import { Point, Size } from './Geometry';
import { QuestATrigger, QuestKey } from './Quests';
import { RenderingLayer, RenderingType } from './Renderer';
import { Seed, SeedState } from './Seed';
import { Sign } from './Sign';
import { Snowball } from './Snowball';
import { Sound } from './Sound';
import { SpeechBubble } from './SpeechBubble';
import { Stone, StoneState } from './Stone';
import { Wall } from './Wall';
import { Wood, WoodState } from './Wood';

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
    { message: "OK, I'm not Jesus. Noted!", duration: 4000 },
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

    @asset([
        "sprites/buttons_keyboard.aseprite.json",
        "sprites/buttons_xbox.aseprite.json",
        "sprites/buttons_playstation.aseprite.json"
    ])
    public static buttons: Aseprite[];
    public controllerSpriteMapRecords: Record<ControllerSpriteMap, Aseprite> = {
        [ControllerSpriteMap.KEYBOARD]: Player.buttons[0],
        [ControllerSpriteMap.XBOX]: Player.buttons[1],
        [ControllerSpriteMap.PLAYSTATION]: Player.buttons[2]
    };

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
    private hasFriendship = false;
    private usedJump = false;
    private usedDoubleJump = false;
    // private hasBeard = false;
    private autoMove: AutoMove | null = null;
    public isControllable: boolean = true;
    private showHints = false;

    public playerConversation: PlayerConversation | null = null;

    public speechBubble = new SpeechBubble(
        this.scene,
        new Point(this.position.x, this.position.y),
        undefined,
        undefined,
        undefined,
        true
    );
    public thinkBubble: SpeechBubble | null = null;

    private closestNPC: NPC | null = null;
    private readableTrigger?: GameObjectInfo;
    private dustEmitter: ParticleEmitter;
    private bounceEmitter: ParticleEmitter;
    private doubleJumpEmitter: ParticleEmitter;
    private genderSwapEmitter: ParticleEmitter;
    private disableParticles = false;

    public constructor(scene: GameScene, position: Point) {
        super(scene, position, new Size(PLAYER_WIDTH, PLAYER_HEIGHT));
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
        this.dustEmitter = this.scene.particles.createEmitter({
            position: this.position,
            velocity: () => new Point(rnd(-1, 1) * 26, rnd(0.7, 1) * 45),
            color: () => rndItem(groundColors),
            size: rnd(1, 2),
            gravity: new Point(0, -100),
            lifetime: () => rnd(0.5, 0.8),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });
        this.bounceEmitter = this.scene.particles.createEmitter({
            position: this.position,
            velocity: () => new Point(rnd(-1, 1) * 90, rnd(0.7, 1) * 60),
            color: () => rndItem(bounceColors),
            size: rnd(1.5, 3),
            gravity: new Point(0, -120),
            lifetime: () => rnd(0.4, 0.6),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });
        this.doubleJumpEmitter = this.scene.particles.createEmitter({
            position: this.position,
            velocity: () => new Point(rnd(-1, 1) * 90, rnd(-1, 0) * 100),
            color: () => rndItem(DOUBLE_JUMP_COLORS),
            size: rnd(1.5, 3),
            gravity: new Point(0, -120),
            lifetime: () => rnd(0.4, 0.6),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });
        this.genderSwapEmitter = this.scene.particles.createEmitter({
            position: this.position,
            velocity: () => new Point(rnd(-1, 1) * 45, rnd(-1, 1) * 45),
            color: () => rndItem(genderSwapColors),
            size: rnd(2, 2),
            gravity: Point.ORIGIN,
            lifetime: () => rnd(0.5, 1),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });
    }

    public toggleGender () {
        this.genderSwapEmitter.setPosition(this.position.x, this.position.y + Player.playerSprites[this.gender].height / 2);
        this.genderSwapEmitter.emit(20);
        Player.genderSwapSound.play();
        this.gender = this.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;
        Conversation.setGlobal("ismale", this.gender === Gender.MALE ? "true" : "" );
    }

    public getControllable (): boolean {
        return this.isControllable;
    }

    public setControllable (isControllable: boolean): void {
        this.isControllable = isControllable;
    }

    public startAutoMove (x: number, turnAround: boolean) {
        if (!this.autoMove) {
            // this.isControllable = false;
            this.autoMove = {
                destinationX: x,
                lastX: this.position.x,
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
        // this.isControllable = true;
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

    public disableMultiJump (): void {
        this.multiJump = false;
    }

    public enableFriendship (): void {
        if (!this.hasFriendship) {
            this.scene.scenes.pushScene(GotItemScene, { item: Item.FRIENDSHIP });
            this.hasFriendship = true;
            Conversation.setGlobal("hasFriendship", "true");
            this.scene.removeGameObject(this.scene.powerShiba);
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

        if (this.canRun && event.isPlayerRun) {
            this.running = true;
        }

        if (event.isPlayerMoveRight) {
            this.moveRight = true;
            this.moveLeft = false;
        } else if (event.isPlayerMoveLeft) {
            this.moveLeft = true;
            this.moveRight = false;
        } else if (event.isPlayerEnterDoor) {
            if (!this.canEnterDoor()) return;
            const gate = this.scene.world.getGateCollisions(this)[0];
            this.enterGate(gate);
        } else if (event.isPlayerInteract) {
            // Check for gates / doors
            if (!this.flying) {
                if (this.closestNPC && this.closestNPC.isReadyForConversation() && this.closestNPC.conversation) {
                    const conversation = this.closestNPC.conversation;
                    // Disable auto movement to a safe talking distance for the stone in the river
                    const autoMove = this.closestNPC instanceof Sign || (this.closestNPC instanceof Stone && this.closestNPC.state !== StoneState.DEFAULT) ? false : true;
                    this.playerConversation = new PlayerConversation(this, this.closestNPC, conversation, autoMove);
                } else if (this.readableTrigger) {
                    const proxy = new ConversationProxy(this.scene, this.position, this.readableTrigger.properties);
                    this.playerConversation = new PlayerConversation(this, proxy, proxy.conversation, false);
                } else if (this.canDanceToMakeRain()) {
                    this.startDance(this.scene.apocalypse ? 3 : 2);
                    this.scene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.MADE_RAIN);
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

        this.size.resizeHeight(PLAYER_HEIGHT);
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
            } else if (event.key === "u" && !this.carrying) {
                this.carry(this.scene.bone);
            } else if (event.key === "i" && !this.carrying) {
                this.carry(this.scene.tree.seed.spawnWood());
            } else if (event.key === "t") {
                this.scene.gameObjects.push(new Snowball(this.scene, new Point(this.position.x, this.position.y + this.size.height * 0.75), 20 * this.direction, 10));
                Player.throwingSound.stop();
                Player.throwingSound.play();
            } else if (event.key === "k") {
                this.multiJump = true;
                this.doubleJump = true;
                this.canRun = true;
                this.canRainDance = true;
                this.think("I can everything now", 1500);
            } else if (event.key === "m") {
                this.scene.showBounds = !this.scene.showBounds;
                this.think("Toggling Bounds", 1500);
            }
        }
    }

    public async think(message: string, time: number): Promise<void> {
        if (this.thinkBubble) {
            this.thinkBubble.hide();
            this.thinkBubble = null;
        }
        const thinkBubble = this.thinkBubble = new SpeechBubble(this.scene, new Point(this.position.x, this.position.y));
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
                    this.dance = new Dance(
                        this.scene,
                        new Point(this.position.x, this.position.y - 25),
                        100,
                        "  1 1 2 2 1 2 1 3",
                        undefined,
                        1,
                        undefined,
                        true,
                        0
                    );
                    break;
                case 2:
                    this.dance = new Dance(
                        this.scene,
                        new Point(this.position.x, this.position.y - 25),
                        192,
                        "1   2   1 1 2 2 121 212 121 212 3    ",
                        undefined,
                        3
                    );
                    break;
                case 3:
                    this.dance = new Dance(
                        this.scene,
                        new Point(this.position.x, this.position.y - 25),
                        192,
                        "112 221 312 123 2121121 111 222 3    ",
                        undefined,
                        4
                    );
                    break;
                default:
                    this.dance = new Dance(
                        this.scene,
                        new Point(this.position.x, this.position.y - 25),
                        192,
                        "3"
                    );
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

                    this.position.moveTo(
                        targetGate.x + (targetGate.width / 2),
                        targetGate.y - targetGate.height
                    )
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
                this.doubleJumpEmitter.setPosition(this.position.x, this.position.y + 20);
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
        } else if (event.isPlayerMoveLeft) {
            this.moveLeft = false;
        } else if (event.isPlayerJump) {
            this.jumpKeyPressed = false;
        } else if (event.isPlayerDrop) {
            this.jumpDown = false;
        } else if (event.isPlayerRun) {
            this.running = false;
        }
    }

    private drawTooltip (
        text: string,
        buttonTag: ControllerAnimationTags = ControllerAnimationTags.ACTION
    ) {
        const controllerSprite = ControllerManager.getInstance().controllerSprite;
        const measure = Player.font.measureText(text);
        const gap = 6;
        const offsetY = 12;
        const textPosition = new Point(
            Math.round(this.position.xRounded - ((measure.width - this.controllerSpriteMapRecords[controllerSprite].width + gap) / 2)),
            -this.position.y + offsetY
        );


        this.scene.renderer.add({
            type: RenderingType.ASEPRITE,
            layer: RenderingLayer.UI,
            position: new Point(
                textPosition.x - this.controllerSpriteMapRecords[controllerSprite].width - gap,
                textPosition.y
            ),
            asset: this.controllerSpriteMapRecords[controllerSprite],
            animationTag: buttonTag,
        })

        this.scene.renderer.add({
            type: RenderingType.TEXT,
            layer: RenderingLayer.UI,
            text,
            textColor: "white",
            outlineColor: "black",
            position: textPosition,
            asset: Player.font,
        })
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) return;

        const sprite = Player.playerSprites[this.gender];
        let animation = this.animation;
        if (this.carrying && (animation === "idle" || animation === "walk" || animation === "jump" || animation === "fall")) {
            animation = animation + "-carry";
        }

        this.scene.renderer.addAseprite(sprite, animation, new Point(this.position.x, this.position.y - 1), RenderingLayer.PLAYER, this.direction)

        if (this.scene.showBounds) this.drawBounds();

        if (this.closestNPC && !this.dance && !this.playerConversation && this.closestNPC.isReadyForConversation()) {
            this.drawTooltip(this.closestNPC.getInteractionText(), ControllerAnimationTags.INTERACT);
        } else if (this.readableTrigger) {
            this.drawTooltip("Examine", ControllerAnimationTags.INTERACT);
        } else if (this.canEnterDoor()) {
            this.drawTooltip("Enter", ControllerAnimationTags.OPEN_DOOR);
        } else if (this.canThrowStoneIntoWater()) {
            this.drawTooltip("Throw stone", ControllerAnimationTags.ACTION);
        } else if (this.canThrowSeedIntoSoil()) {
            this.drawTooltip("Plant seed", ControllerAnimationTags.ACTION);
        } else if (this.canDanceToMakeRain()) {
            this.drawTooltip("Dance", ControllerAnimationTags.INTERACT);
        }

        if (this.dance) {
            this.dance.addDanceToRenderQueue();
        }

        this.speechBubble.draw(ctx);
        if (this.thinkBubble) {
            this.thinkBubble.draw(ctx);
        }
    }

    private canThrowStoneIntoWater(): boolean {
        return this.carrying instanceof Stone && (this.direction === -1 &&
            this.scene.world.collidesWith(new Point(this.position.x - 30, this.position.y - 20)) === Environment.WATER);
    }

    private canThrowSeedIntoSoil(): boolean {
        return this.carrying instanceof Seed && (this.direction === -1 &&
            this.scene.world.collidesWith(new Point(this.position.x - 30, this.position.y + 2)) === Environment.SOIL);
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
        this.position.moveTo(
            this.lastGroundPosition.x,
            this.lastGroundPosition.y + 10
        )
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

        this.speechBubble.update(this.position);

        if (this.thinkBubble) {
            this.thinkBubble.update(this.position);
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
            this.carrying.position.moveXTo(this.position.x);
            const currentFrameIndex = Player.playerSprites[this.gender].getTaggedFrameIndex(this.animation + "-carry",
                this.scene.gameTime * 1000);
            const carryOffsetFrames = this.getPlayerSpriteMetadata()[this.gender].carryOffsetFrames ?? [];
            const offset = carryOffsetFrames.includes(currentFrameIndex + 1) ? 0 : -1;

            this.carrying.position.moveYTo(
                this.position.y + (this.size.height - this.carrying.carryHeight) - offset
            );

            if (this.carrying instanceof Stone) {
                this.carrying.direction = this.direction;
            }
        }

        const isDrowning = this.scene.world.collidesWith(this.position) === Environment.WATER;

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
            if ((this.autoMove.lastX - this.autoMove.destinationX) * (this.position.x - this.autoMove.destinationX) <= 0 ) {
                // Reached or overreached destination
                this.stopAutoMove();
            } else {
                // Not yet reached, keep going
                this.autoMove.lastX = this.position.x;
                if (this.position.x < this.autoMove.destinationX) {
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
            } else if (isDrowning || (this.getVelocityY() < 0 && this.position.y - world.getGround(this.position) > 10)) {
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
                    this.dustEmitter.setPosition(this.position.x, this.position.y);
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
        if (
            this.scene.world.collidesWith(
                new Point(this.position.x, this.position.y - 2),
                [ this ]
            ) === Environment.BOUNCE
        ) {
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
            this.dance.setPosition(this.position.x, this.position.y - 16);
            const done = this.dance.update(dt);
            if (done) {
                // On cloud -> make it rain
                if (this.dance.wasSuccessful()) {
                    // (Useless because wrong cloud but hey…)
                    const ground = this.getGround();
                    if (ground && ground instanceof Cloud) {
                        ground.startRain(this.scene.apocalypse ? Infinity : 15);

                        // Camera focus to boss for each triggered rain cloud
                        const bossPointer = this.scene.pointsOfInterest.find(poi => poi.name === 'boss_spawn');
                        if (bossPointer) {
                            this.scene.camera.focusOn(3, new Point(bossPointer.x, bossPointer.y + 60), 1, 0, valueCurves.cos(0.35));
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
                        this.position.moveYBy(teleportY);
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

            col = world.collidesWith(
                this.position,
                [ this ],
                this.jumpDown ? [ Environment.PLATFORM, Environment.WATER ] : [ Environment.WATER ]
            );

            while (this.position.y < height && col) {
                pulled++;
                this.position.moveYBy(1);
                col = world.collidesWith(this.position);
            }
        }
        return pulled;
    }

    private bounce(): void {
        this.setVelocityY(Math.sqrt(2 * PLAYER_BOUNCE_HEIGHT * GRAVITY));
        // Nice bouncy particles
        this.bounceEmitter.setPosition(this.position.x, this.position.y - 12);
        this.bounceEmitter.emit(20);
        this.dustEmitter.clear();
        Player.bouncingSound.stop();
        Player.bouncingSound.play();
    }

    public setBeard(beard: boolean) {
        // this.hasBeard = beard;
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

        while (
            this.position.y > 0
            && world.collidesWith(
                new Point(this.position.x, this.position.y + this.size.height),
                [ this ],
                [ Environment.PLATFORM, Environment.WATER ]
            )
        ) {
            pulled++;
            this.position.moveYBy(-1);
        }

        return pulled;
    }

    private pullOutOfWall(): number {
        let pulled = 0;
        const world = this.scene.world;

        if (this.getVelocityX() > 0) {
            while (
                world.collidesWithVerticalLine(
                    new Point(this.position.x + this.size.width / 2, this.position.y + this.size.height * 3 / 4),
                    this.size.height / 2,
                    [ this ],
                    [ Environment.PLATFORM, Environment.WATER ]
                )
            ) {
                this.position.moveXBy(-1);
                pulled++;
            }
        } else {
            while (
                world.collidesWithVerticalLine(
                    new Point(this.position.x - this.size.width / 2, this.position.y + this.size.height * 3 / 4),
                    this.size.height / 2,
                    [ this ],
                    [ Environment.PLATFORM, Environment.WATER ]
                )
            ) {
                this.position.moveXBy(1);
                pulled++;
            }
        }

        return pulled;
    }

    protected updatePosition(newX: number, newY: number): void {
        this.position.moveTo(newX, newY);

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
            this.size.resizeHeight(PLAYER_HEIGHT + object.carryHeight + PLAYER_CARRY_HEIGHT);

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
            object.position.moveTo(this.position.x, this.position.y + this.size.height);
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
