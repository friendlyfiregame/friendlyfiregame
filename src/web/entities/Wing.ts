import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity, type EntityArgs } from "../Entity";
import { QuestATrigger, QuestKey } from "../Quests";
import { RenderingLayer } from "../Renderer";
import { NPC } from "./NPC";

@entity("wing")
export class Wing extends NPC {
    @asset("sprites/wing.aseprite.json")
    private static readonly sprite: Aseprite;

    private readonly floatAmount = 4;
    private readonly floatSpeed = 2;

    public constructor(args: EntityArgs) {
        super({ width: 24, height: 24, ...args });
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

    public override draw(ctx: CanvasRenderingContext2D): void {
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;

        this.scene.renderer.addAseprite(
            Wing.sprite,
            "idle",
            this.x, this.y - floatOffsetY,
            RenderingLayer.ENTITIES
        );

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
