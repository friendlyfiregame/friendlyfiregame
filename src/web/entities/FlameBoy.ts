import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { type Sound } from "../audio/Sound";
import { SoundEmitter } from "../audio/SoundEmitter";
import { entity, type EntityArgs } from "../Entity";
import { EyeType, Face, FaceModes } from "../Face";
import { Direction } from "../geom/Direction";
import { QuestATrigger, QuestKey } from "../Quests";
import { RenderingLayer } from "../Renderer";
import { AsepriteNode } from "../scene/AsepriteNode";
import { rndItem } from "../util";
import { isEntityName, isInstanceOf } from "../util/predicates";
import { ScriptableNPC } from "./ScriptableNPC";
import { DirectionTrigger } from "./triggers/DirectionTrigger";
import { type Wood } from "./Wood";

export enum FlameBoyState {
    VENDOR,
    WAITING_FOR_DIALOG,
    IDLE
}

const IDLE_DURATION = [2, 3, 4];
const WALK_DURATION = [1, 1.5, 2];
const ACCELERATION = 15;

@entity("FlameBoy")
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
    private readonly asepriteNode: AsepriteNode;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 26, height: 54 });
        this.setMaxVelocity(3);
        this.face = new Face(this.scene, this, EyeType.FLAMEBOY, 0, -5);
        this.defaultFaceMode = FaceModes.BORED;
        this.face.setMode(this.defaultFaceMode);
        this.soundEmitter = new SoundEmitter({
            scene: this.scene,
            x: this.x,
            y: this.y,
            sound: FlameBoy.fireAmbience,
            volume: 0.7,
            intensity: 0.2
        });
        this.asepriteNode = new AsepriteNode({
            aseprite: FlameBoy.sprite,
            tag: "idle",
            layer: RenderingLayer.ENTITIES,
            anchor: Direction.BOTTOM,
            y: 1
        }).appendTo(this);
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
            this.face = new Face(this.scene, this, EyeType.FLAMEBOY2, 0, -2);
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
        if (this.move === 0) {
            switch (this.state) {
                case FlameBoyState.VENDOR: return "idle";
                default: return "idle2";
            }
        } else {
            return "walk";
        }
    }

    private walkRandomly(dt: number, action?: DirectionTrigger): void {
        if (action != null && action.direction != null) {
            this.autoMoveDirection = action.direction > 0 ? 1 : -1;
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

    public override render(): void {
        this.drawFace(false);

        if (this.thinkBubble) {
            this.thinkBubble.draw();
        }

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        this.speechBubble.draw();
    }

    public override update(dt: number): void {
        super.update(dt);

        // Flame Boy action triggers
        const actions = this.scene.world.getEntityCollisions(this).filter(isInstanceOf(DirectionTrigger)).filter(isEntityName("flameboy_action"));

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

        this.dialoguePrompt.update(dt, this.x, this.y - 32);
        this.speechBubble.update(this.x, this.y);
        this.soundEmitter.update();

        this.asepriteNode.setTag(this.getAnimationTag());
        this.asepriteNode.transform(m => m.setScale(this.direction, 1));
    }
}
