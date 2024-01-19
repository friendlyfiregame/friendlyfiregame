import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Sound } from "../audio/Sound";
import { SoundEmitter } from "../audio/SoundEmitter";
import { entity } from "../Entity";
import { EyeType, Face, FaceModes } from "../Face";
import type { GameObjectInfo } from "../MapInfo";
import { QuestATrigger, QuestKey } from "../Quests";
import { RenderingLayer } from "../Renderer";
import { GameScene } from "../scenes/GameScene";
import { rndItem } from "../util";
import { ScriptableNPC } from "./ScriptableNPC";
import type { Wood } from "./Wood";

export enum FlameBoyState {
    VENDOR,
    WAITING_FOR_DIALOG,
    IDLE
}

const IDLE_DURATION = [2, 3, 4];
const WALK_DURATION = [1, 1.5, 2];
const ACCELERATION = 15;

@entity("flameboy")
export class FlameBoy extends ScriptableNPC {
    @asset("sprites/flameboy.aseprite.json")
    private static readonly sprite: Aseprite;

    @asset("sounds/fire/fire2.ogg")
    private static readonly fireAmbience: Sound;
    private readonly soundEmitter: SoundEmitter;

    private state = FlameBoyState.VENDOR;
    private idleTimer: number | null = rndItem(IDLE_DURATION);
    private walkTimer: number | null = null;
    private autoMoveDirection: 1 | -1 = 1;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 26, 54);
        this.setMaxVelocity(3);
        this.face = new Face(scene, this, EyeType.FLAMEBOY, 0, 5);
        this.defaultFaceMode = FaceModes.BORED;
        this.face.setMode(this.defaultFaceMode);
        this.soundEmitter = new SoundEmitter(this.scene, this.x, this.y, FlameBoy.fireAmbience, 0.7, 0.2);
    }

    public setState(state: FlameBoyState): void {
        this.state = state;
    }

    public getState(): FlameBoyState {
        return this.state;
    }

    public feed(wood: Wood): void {
        wood.remove();
        this.scene.game.campaign.runAction("giveWoodToFlameboy");
        void this.think("Well, that was unexpected…", 2000);
        this.nextState();
    }

    public nextState(): void {
        this.state++;
        if (this.state === FlameBoyState.WAITING_FOR_DIALOG) {
            this.defaultFaceMode = FaceModes.NEUTRAL;
            this.face = new Face(this.scene, this, EyeType.FLAMEBOY2, 0, 2);
        }
    }

    protected override showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        const thrownStoneIntoWater = (
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.THROWN_STONE_INTO_WATER
            && this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.GOT_MULTIJUMP
        );
        const waitingForWoodDialog = this.state === FlameBoyState.WAITING_FOR_DIALOG;

        return thrownStoneIntoWater || waitingForWoodDialog;
    }

    private getAnimationTag(): string {
        switch (this.state) {
            case FlameBoyState.VENDOR: return "idle";
            default: return "idle2";
        }
    }

    private walkRandomly(triggerCollisions: GameObjectInfo[], dt: number): void {
        if (triggerCollisions.length > 0) {
            const event = triggerCollisions.find(t => t.name === "flameboy_action");

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

        if (this.idleTimer != null && this.idleTimer <= 0 && this.walkTimer === null) {
            this.walkTimer = rndItem(WALK_DURATION);
            this.idleTimer = null;
            this.move = this.autoMoveDirection;
        }

        if (this.walkTimer != null && this.walkTimer <= 0 && this.idleTimer === null) {
            this.idleTimer = rndItem(IDLE_DURATION);
            this.walkTimer = null;
            this.move = 0;
        }
    }


    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.move === 0) {
            this.scene.renderer.addAseprite(
                FlameBoy.sprite, this.getAnimationTag(), this.x, this.y, RenderingLayer.ENTITIES, this.direction
            );
        } else {
            this.scene.renderer.addAseprite(
                FlameBoy.sprite, "walk", this.x, this.y, RenderingLayer.ENTITIES, this.direction
            );
        }

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        this.drawFace(ctx, false);

        if (this.thinkBubble) {
            this.thinkBubble.draw(ctx);
        }

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        this.speechBubble.draw(ctx);
    }

    public override update(dt: number): void {
        super.update(dt);

        // Triggers
        const triggerCollisions = this.scene.world.getTriggerCollisions(this);

        if (this.hasActiveConversation()) {
            this.move = 0;
        } else {
            if (this.state === FlameBoyState.IDLE) {
                this.walkRandomly(triggerCollisions, dt);
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

        if (this.thinkBubble) {
            this.thinkBubble.update(this.x, this.y);
        }

        this.dialoguePrompt.update(dt, this.x, this.y + 32);
        this.speechBubble.update(this.x, this.y);
        this.soundEmitter.update();
    }
}
