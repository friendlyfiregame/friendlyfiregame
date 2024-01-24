import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Sound } from "../audio/Sound";
import { SoundEmitter } from "../audio/SoundEmitter";
import { entity, type EntityArgs } from "../Entity";
import { QuestATrigger, QuestKey } from "../Quests";
import { RenderingLayer, RenderingType } from "../Renderer";
import { NPC } from "./NPC";

enum AnimationTag {
    INVISIBLE = "invisible",
    IDLE = "idle"
}

@entity("shadowpresence")
export class ShadowPresence extends NPC {
    @asset("sprites/shadowpresence.aseprite.json")
    private static readonly sprite: Aseprite;

    @asset("sounds/ambient/cave.ogg")
    private static readonly caveAmbience: Sound;
    private readonly soundEmitter: SoundEmitter;

    private isNearPlayer = false;

    public constructor(args: EntityArgs) {
        super({ width: 12, height: 46, ...args });
        this.direction = -1;
        this.lookAtPlayer = false;
        this.soundEmitter = new SoundEmitter({
            scene: this.scene,
            x: this.x,
            y: this.y,
            sound: ShadowPresence.caveAmbience,
            maxVolume: 0.3,
            intensity: 1
        });
    }

    protected override showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        return (
            this.isNearPlayer
            && this.scene.game.campaign.getQuest(QuestKey.A).isTriggered(QuestATrigger.TALKED_TO_FIRE)
            && !this.scene.game.campaign.getQuest(QuestKey.A).isTriggered(QuestATrigger.GOT_RUNNING_ABILITY)
        );
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const scale = this.direction < 0 ? { x: -1, y: 1 } : undefined;
        const animationTag = this.isNearPlayer ? AnimationTag.IDLE : AnimationTag.INVISIBLE;

        this.scene.renderer.add({
            type: RenderingType.ASEPRITE,
            layer: RenderingLayer.ENTITIES,
            translation: { x: this.x, y: -this.y },
            position: {
                x: -ShadowPresence.sprite.width >> 1,
                y: -ShadowPresence.sprite.height
            },
            scale,
            asset: ShadowPresence.sprite,
            animationTag,
            time: this.scene.gameTime * 1000
        });

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        this.speechBubble.draw(ctx);
    }

    public checkPlayerDistance(): void {
        this.isNearPlayer = false;
        if (this.distanceTo(this.scene.player) < 60) {
            this.isNearPlayer = true;
        }
    }

    public override update(dt: number): void {
        super.update(dt);

        this.checkPlayerDistance();
        this.dialoguePrompt.update(dt, this.x, this.y + 48);
        this.speechBubble.update(this.x, this.y + 12);
        this.soundEmitter.update();
    }
}
