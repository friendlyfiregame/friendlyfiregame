import { entity } from "./Entity";
import { NPC } from './NPC';
import { Face, EyeType, FaceModes } from './Face';
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { QuestATrigger, QuestBTrigger, QuestKey } from './Quests';
import { RenderingLayer } from './Renderer';

@entity("flameboy")
export class FlameBoy extends NPC {
    @asset("sprites/flameboy.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 26, 54);
        this.face = new Face(scene, this, EyeType.FLAMEBOY, 0, 5);
        this.defaultFaceMode = FaceModes.BORED
        this.face.setMode(this.defaultFaceMode);
    }

    protected showDialoguePrompt (): boolean {
        if (!super.showDialoguePrompt()) return false;
        return (
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.THROWN_STONE_INTO_WATER &&
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.GOT_MULTIJUMP
        );
    }

    private isCorrupted (): boolean {
        return this.scene.game.campaign.getQuest(QuestKey.B).isTriggered(QuestBTrigger.FLAMEBOY_CORRUPTED);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const animationTag = this.isCorrupted() ? "corrupt" : "idle";
        this.scene.renderer.addAseprite(FlameBoy.sprite, animationTag, this.x, this.y, RenderingLayer.ENTITIES, this.direction);
        if (this.scene.showBounds) this.drawBounds();
        this.drawFace(ctx, false);
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.dialoguePrompt.update(dt, this.x, this.y + 32);
        this.speechBubble.update(this.x, this.y);
    }
}
