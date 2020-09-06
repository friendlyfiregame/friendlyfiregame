import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import { QuestATrigger, QuestKey } from "./Quests";
import { RenderingLayer, RenderingType } from "./Renderer";
import { Sound } from "./Sound";
import { SoundEmitter } from "./SoundEmitter";

enum AnimationTag {
    INVISIBLE = "invisible",
    IDLE = "idle"
}

@entity("shadowpresence")
export class ShadowPresence extends NPC {
    @asset("sprites/shadowpresence.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/ambient/cave.ogg")
    private static caveAmbience: Sound;
    private soundEmitter: SoundEmitter;

    private isNearPlayer = false;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 12, 46);
        this.direction = -1;
        this.lookAtPlayer = false;
        this.soundEmitter = new SoundEmitter(this.scene, this.x, this.y, ShadowPresence.caveAmbience, 0.3, 1);
    }

    protected showDialoguePrompt(): boolean {
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

        this.scene.renderer.draw(ctx, {
            type: RenderingType.ASEPRITE,
            layer: RenderingLayer.ENTITIES,
            position: {
                x: -ShadowPresence.sprite.width >> 1,
                y: -ShadowPresence.sprite.height
            },
            scale,
            asset: ShadowPresence.sprite,
            animationTag,
            time: this.scene.gameTime * 1000
        });
    }

    public checkPlayerDistance(): void {
        this.isNearPlayer = false;
        if (this.distanceTo(this.scene.player) < 60) {
            this.isNearPlayer = true;
        }
    }

    public update(dt: number): void {
        super.update(dt);

        this.checkPlayerDistance();
        this.dialoguePrompt.updatePosition(0, 48);
        this.soundEmitter.update();
    }
}
