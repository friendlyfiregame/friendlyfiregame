import { entity } from "./Entity";
import { NPC } from './NPC';
import { Face, EyeType, FaceModes } from './Face';
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { QuestATrigger, QuestBTrigger, QuestKey } from './Quests';

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

    private showDialoguePrompt (): boolean {
        return (
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.THROWN_STONE_INTO_WATER &&
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.GOT_MULTIJUMP
        );
    }

    private isCorrupted (): boolean {
        return this.scene.game.campaign.getQuest(QuestKey.B).isTriggered(QuestBTrigger.FLAMEBOY_CORRUPTED);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }
        FlameBoy.sprite.drawTag(ctx, this.isCorrupted() ? "corrupt" : "idle", -FlameBoy.sprite.width >> 1, -FlameBoy.sprite.height,
            this.scene.gameTime * 1000);
        ctx.restore();
        if (this.scene.showBounds) this.drawBounds(ctx);
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
