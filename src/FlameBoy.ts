import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { entity } from "./Entity";
import { EyeType, Face, FaceModes } from "./Face";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import { QuestATrigger, QuestKey } from "./Quests";
import { RenderingLayer } from "./RenderingLayer";
import { Sound } from "./Sound";
import { SoundEmitter } from "./SoundEmitter";

@entity("flameboy")
export class FlameBoy extends NPC {
    @asset("sprites/flameboy.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/fire/fire2.ogg")
    private static fireAmbience: Sound;
    private soundEmitter: SoundEmitter;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 26, 54);
        this.setLayer(RenderingLayer.ENTITIES);
        this.face = new Face(scene, EyeType.FLAMEBOY, false, 0, 5).appendTo(this);
        this.defaultFaceMode = FaceModes.BORED;
        this.face.setMode(this.defaultFaceMode);
        this.soundEmitter = new SoundEmitter(this.scene, this.x, this.y, FlameBoy.fireAmbience, 0.7, 0.2);
    }

    protected showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        return (
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.THROWN_STONE_INTO_WATER
            && this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.GOT_MULTIJUMP
        );
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.scale(this.direction, 1);
        FlameBoy.sprite.drawTag(ctx, "idle", -FlameBoy.sprite.width >> 1, -FlameBoy.sprite.height);
        ctx.restore();
    }

    public update(dt: number): void {
        super.update(dt);

        this.dialoguePrompt.updatePosition(0, 32);
        this.soundEmitter.update();
    }
}
