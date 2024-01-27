import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Sound } from "../audio/Sound";
import { SoundEmitter } from "../audio/SoundEmitter";
import { entity, type EntityArgs } from "../Entity";
import { EyeType, Face, FaceModes } from "../Face";
import { QuestATrigger, QuestKey } from "../Quests";
import { RenderingLayer } from "../Renderer";
import { FlameBoyAction } from "../triggers/FlameBoyAction";
import { rndItem } from "../util";
import { isInstanceOf } from "../util/predicates";
import { ScriptableNPC } from "./ScriptableNPC";
import { type Wood } from "./Wood";

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

    public constructor(args: EntityArgs) {
        super({ width: 26, height: 54, ...args });
        this.setMaxVelocity(3);
        this.face = new Face(this.scene, this, EyeType.FLAMEBOY, 0, 5);
        this.defaultFaceMode = FaceModes.BORED;
        this.face.setMode(this.defaultFaceMode);
        this.soundEmitter = new SoundEmitter({
            scene: this.scene,
            x: this.x,
            y: this.y,
            sound: FlameBoy.fireAmbience,
            maxVolume: 0.7,
            intensity: 0.2
        });
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

    private walkRandomly(dt: number, action?: FlameBoyAction): void {
        if (action != null && action.velocity != null) {
            this.autoMoveDirection = action.velocity > 0 ? 1 : -1;
            this.move = this.autoMoveDirection;
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


    public override draw(ctx: CanvasRenderingContext2D): void {
        if (this.move === 0) {
            this.scene.renderer.addAseprite(
                FlameBoy.sprite, this.getAnimationTag(), this.x, this.y, RenderingLayer.ENTITIES, this.direction
            );
        } else {
            this.scene.renderer.addAseprite(
                FlameBoy.sprite, "walk", this.x, this.y, RenderingLayer.ENTITIES, this.direction
            );
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

        // Flame Boy action triggers
        const actions = this.scene.world.getEntityCollisions(this).filter(isInstanceOf(FlameBoyAction));

        if (this.hasActiveConversation()) {
            this.move = 0;
        } else {
            if (this.state === FlameBoyState.IDLE) {
                this.walkRandomly(dt, actions[0]);
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
