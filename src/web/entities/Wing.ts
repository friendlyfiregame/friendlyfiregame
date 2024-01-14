import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import { NPC } from "./NPC";
import { QuestATrigger, QuestKey } from "../Quests";
import { RenderingLayer } from "../Renderer";

@entity("wing")
export class Wing extends NPC {
    @asset("sprites/wing.aseprite.json")
    private static readonly sprite: Aseprite;

    private readonly floatAmount = 4;
    private readonly floatSpeed = 2;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 24, 24);
    }

    protected override showDialoguePrompt(): boolean {
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

        this.scene.renderer.addAseprite(
            Wing.sprite,
            "idle",
            this.x, this.y - floatOffsetY,
            RenderingLayer.ENTITIES
        );

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        this.speechBubble.draw(ctx);
    }

    public override update(dt: number): void {
        super.update(dt);

        this.dialoguePrompt.update(dt, this.x, this.y + 16);
        this.speechBubble.update(this.x, this.y);
    }
}
