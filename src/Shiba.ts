import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { calculateVolume, rnd, rndItem } from './util';
import { Conversation } from './Conversation';
import conversation from '../assets/dialog/bird.dialog.json';
import { DOUBLE_JUMP_COLORS, GRAVITY } from './constants';
import { entity } from './Entity';
import { Environment } from './World';
import { FaceModes } from './Face';
import { FireState, SHRINK_SIZE } from './Fire';
import { GameObjectInfo } from './MapInfo';
import { GameScene } from './scenes/GameScene';
import { ParticleEmitter, valueCurves } from './Particles';
import { QuestKey } from './Quests';
import { RenderingLayer } from './Renderer';
import { ScriptableNPC } from './ScriptableNPC';
import shiba1 from '../assets/dialog/shiba1.dialog.json';
import { Sound } from './Sound';

const IDLE_DURATION = [2, 3, 4];
const WALK_DURATION = [0.5, 1, 1.2, 1.5];
const ACCELERATION = 15;

export enum ShibaState {
    ON_TREE,
    FLYING_AWAY,
    ON_MOUNTAIN,
    GOING_TO_FIRE,
    KILLING_FIRE,
    FIRE_KILLED
}

const FLYING_DURATION = 8;
const JUMP_INTERVAL = 0.3;

@entity("shiba")
export class Shiba extends ScriptableNPC {
    @asset("sprites/shiba.aseprite.json")
    private static sprite: Aseprite;
    @asset("sounds/ending/putOut.mp3")
    private static putOutSound: Sound;
    @asset("sounds/jumping/jump_neutral.ogg")
    private static jumpSound: Sound;
    private state = ShibaState.ON_TREE;
    private idleTimer: number | null = rndItem(IDLE_DURATION);
    private walkTimer: number | null = null;
    private autoMoveDirection: 1 | -1 = 1;
    
    private doubleJumpEmitter: ParticleEmitter;
    private minAltitude: number;
    private jumpHeight = 1.5;
    private jumpTimer = 0;
    private flyingTime = 0;
    private saidFarewell = false;
    public peeing = false;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 28, 24);
        this.minAltitude = y;
        this.conversation = new Conversation(conversation, this);
        this.setMaxVelocity(2);
        this.conversation = new Conversation(shiba1, this);

        this.doubleJumpEmitter = this.scene.particles.createEmitter({
            position: {x: this.x, y: this.y},
            velocity: () => ({ x: rnd(-1, 1) * 90, y: rnd(-1, 0) * 100 }),
            color: () => rndItem(DOUBLE_JUMP_COLORS),
            size: rnd(1, 2),
            gravity: {x: 0, y: -120},
            lifetime: () => rnd(0.4, 0.6),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });
    }

    public setState (state: ShibaState): void {
        this.state = state;
    }

    public getState (): ShibaState {
        return this.state;
    }

    public nextState (): void {
        this.state++;

        if (this.state === ShibaState.FLYING_AWAY) {
            this.lookAtPlayer = false;
            this.scene.player.disableMultiJump();
            this.setMaxVelocity(3);
        } else if (this.state === ShibaState.ON_MOUNTAIN) {
            this.move = 0;
            const spawn = this.scene.pointsOfInterest.find(poi => poi.name === "shiba_mountain_spawn");
            if (!spawn) throw new Error('Shiba mountain spawn missing');
            this.x = spawn.x;
            this.y = spawn.y;
            this.scene.game.campaign.runAction("enable", null, ["shiba", "shiba4"]);
            this.scene.powerShiba.nextState();
        } else if (this.state === ShibaState.GOING_TO_FIRE) {
            this.scene.camera.setCinematicBar(1);
            const shibaSpawnPos = this.scene.pointsOfInterest.find(poi => poi.name === "friendship_shiba_spawn");
            this.lookAtPlayer = false;
            this.setMaxVelocity(2);

            this.scene.startFriendshipMusic();
            
            if (!shibaSpawnPos) throw new Error(`'friendship_shiba_spawn' point in map is missing`);
            this.x = shibaSpawnPos.x;
            this.y = shibaSpawnPos.y;
        } else if (this.state === ShibaState.KILLING_FIRE) {
            this.move = 0;

            setTimeout(() => this.think('Wow!', 1500), 500);
            setTimeout(() => (this.direction = 1), 1000);
            setTimeout(() => {
                this.think('Bad Fire!', 2000);
                this.scene.fire.setState(FireState.BEING_PUT_OUT);
                this.scene.fire.growthTarget = SHRINK_SIZE;
                this.peeing = true;
                Shiba.putOutSound.setVolume(.3);
                Shiba.putOutSound.play();
            }, 2000);
            setTimeout(() => this.scene.fire.think('Oh God…', 2000), 4500);
            setTimeout(() => this.scene.fire.think('Disgusting…', 3000), 8000);
        } else if (this.state === ShibaState.FIRE_KILLED) {
            this.peeing = false;
            this.scene.fire.state = FireState.PUT_OUT;
            Shiba.putOutSound.stop();
            setTimeout(() => (this.direction = -1), 1000);
            setTimeout(() => this.think('I help friend!', 1500), 1500);
            setTimeout(() => {
                this.scene.fire.think('Yeah, great', 2000);
                this.scene.fire.face?.setMode(FaceModes.BORED);
                this.scene.player.isControllable = true;
                this.scene.friendshipCutscene = false;
                this.lookAtPlayer = true;
                this.scene.game.campaign.runAction("enable", null, ["fire", "fire4"]);
                this.scene.game.campaign.runAction("enable", null, ["shiba", "shiba5"]);
                this.scene.game.campaign.getQuest(QuestKey.B).finish();
            }, 3500);
        }
    }

    protected jump (): void {
        this.jumpTimer = JUMP_INTERVAL;
        this.setVelocityY(Math.sqrt(2 * this.jumpHeight * GRAVITY));
        this.doubleJumpEmitter.setPosition(this.x, this.y + 20);
        this.doubleJumpEmitter.emit(20);

        const vol = calculateVolume(this.distanceToPlayer, 0.4)
        if (vol > 0) {
            Shiba.jumpSound.setVolume(vol)
            Shiba.jumpSound.stop();
            Shiba.jumpSound.play();
        }
    }

    protected canJump (): boolean {
        return this.jumpTimer === 0;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.move === 0) {
            const tag = this.peeing ? "peeing" : "idle";
            this.scene.renderer.addAseprite(Shiba.sprite, tag, this.x, this.y, RenderingLayer.ENTITIES, this.direction)
        } else {
            this.scene.renderer.addAseprite(Shiba.sprite, "walk", this.x, this.y, RenderingLayer.ENTITIES, this.direction)
        }

        if (this.scene.showBounds) this.drawBounds();
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        if (this.thinkBubble) {
            this.thinkBubble.draw(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    public showDialoguePrompt (): boolean {
        if (!super.showDialoguePrompt()) return false;
        return false;
    }

    update(dt: number): void {
        super.update(dt);

        // Triggers
        const triggerCollisions = this.scene.world.getTriggerCollisions(this);

        if (this.hasActiveConversation()) {
            this.move = 0;
        } else {
            if (this.state === ShibaState.ON_TREE) {
                this.onTreeUpdateLogic(triggerCollisions, dt)
            } else if (this.state === ShibaState.FLYING_AWAY) {
                this.flyingAwayUpdateLogic(triggerCollisions, dt);
            } else if (this.state === ShibaState.GOING_TO_FIRE) {
                this.walkToFireLogic(triggerCollisions);
            }
        }

        if (this.move !== 0) {
            this.direction = this.move;
            this.accelerateX(ACCELERATION * dt * this.move);
        } else {
            if (this.getVelocityX() > 0) {
                this.decelerateX(ACCELERATION * dt);
            } else {
                this.decelerateX(-ACCELERATION * dt);
            }
        }

        this.dialoguePrompt.update(dt, this.x, this.y + 20);
        this.speechBubble.update(this.x, this.y);
        if (this.thinkBubble) {
            this.thinkBubble.update(this.x, this.y);
        }
    }

    public isReadyForConversation(): boolean | null {
        const superResult = super.isReadyForConversation();
        return (superResult && this.state !== ShibaState.FLYING_AWAY);
    }

    private walkToFireLogic (triggerCollisions: GameObjectInfo[]): void {
        this.move = -1;
        if (this.scene.world.collidesWithVerticalLine(this.x - (this.width / 2), this.y + this.height, this.height, [ this ], [ Environment.PLATFORM, Environment.WATER ])) {
            this.jump();
        }
        if (triggerCollisions.length > 0) {
            const event = triggerCollisions.find(t => t.name === 'shiba_stop');
            if (event) {
                this.nextState();
            }
        }
    }
    private onTreeUpdateLogic (triggerCollisions: GameObjectInfo[], dt: number): void {
        if (triggerCollisions.length > 0) {
            const event = triggerCollisions.find(t => t.name === 'shiba_action');
            if (event && event.properties.velocity) {
                this.autoMoveDirection = event.properties.velocity > 0 ? 1 : -1;
                this.move = this.autoMoveDirection;
            }
        }

        if (this.idleTimer !== null && this.idleTimer >= 0) {
            this.idleTimer -= dt;
        }

        if (this.walkTimer !== null && this.walkTimer >= 0) {
            this.walkTimer -= dt;
        }

        if (this.idleTimer && this.idleTimer <= 0 && this.walkTimer === null) {
            this.walkTimer = rndItem(WALK_DURATION);
            this.idleTimer = null;
            this.move = this.autoMoveDirection;
        }

        if (this.walkTimer && this.walkTimer <= 0 && this.idleTimer === null) {
            this.idleTimer = rndItem(IDLE_DURATION);
            this.walkTimer = null;
            this.move = 0;
        }

        // Check if Bone is near
        if (Conversation.getGlobals()["$gotBoneQuest"] && !Conversation.getGlobals()['$broughtBone'] && this.distanceTo(this.scene.bone) < 100) {
            Conversation.setGlobal('broughtBone', 'true');
            this.think('Wow! Bone!!!', 2000);
            this.scene.game.campaign.runAction("enable", null, ["shiba", "shiba2"]);
        }
    }

    private flyingAwayUpdateLogic (triggerCollisions: GameObjectInfo[], dt: number): void {
        this.move = 1;
        this.minAltitude += 20 * dt;

        if (this.jumpTimer > 0) {
            this.jumpTimer -= dt;
            if (this.jumpTimer < 0) {
                this.jumpTimer = 0;
            }
        }

        if (this.y < this.minAltitude && this.canJump()) {
            this.jump();
        }

        this.flyingTime += dt;

        if (!this.saidFarewell && this.flyingTime > 2) {
            this.saidFarewell = true;
            this.think('See you on the mountain!', 3000);
        }

        if (this.flyingTime >= FLYING_DURATION) {
            this.nextState();
        }
    }
}
