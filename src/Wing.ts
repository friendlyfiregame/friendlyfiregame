import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import { QuestATrigger, QuestKey } from "./Quests";
import { RenderingLayer } from "./Renderer";

@entity("wing")
export class Wing extends NPC {
    @asset("sprites/wing.aseprite.json")
    private static sprite: Aseprite;

    private floatAmount = 4;
    private floatSpeed = 2;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 24, 24);
        this.setLayer(RenderingLayer.ENTITIES);
    }

    protected showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        return (
            this.scene.game.campaign.getQuest(QuestKey.A).isTriggered(QuestATrigger.PLANTED_SEED)
            && !this.scene.game.campaign.getQuest(QuestKey.A).isTriggered(QuestATrigger.LEARNED_RAIN_DANCE)
        );
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;

        this.scene.renderer.drawAseprite(
            ctx,
            Wing.sprite,
            "idle",
            0, -floatOffsetY,
            1
        );
    }

    public update(dt: number): void {
        super.update(dt);
        this.dialoguePrompt.updatePosition(0, 16);
    }
}
