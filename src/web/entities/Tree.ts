import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity, type EntityArgs } from "../Entity";
import { EyeType, Face } from "../Face";
import { QuestATrigger, QuestKey } from "../Quests";
import { RenderingLayer } from "../Renderer";
import { NPC } from "./NPC";

@entity("Tree")
export class Tree extends NPC {
    @asset("sprites/tree.aseprite.json")
    private static readonly sprite: Aseprite;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 78, height: 140 });

        this.face = new Face(this.scene, this, EyeType.TREE, 5, -94);

        this.startDialog();
    }

    public override showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        return (
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.GOT_QUEST_FROM_FIRE
            && this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.GOT_QUEST_FROM_TREE
        ) || (
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.MADE_RAIN
            && this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.TREE_DROPPED_WOOD
        );
    }

    public override render(): void {
        this.scene.renderer.addAseprite(Tree.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES);

        this.drawFace();

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        this.speechBubble.draw();
    }

    public override update(dt: number): void {
        super.update(dt);

        if (this.showDialoguePrompt()) {
            this.dialoguePrompt.update(dt, this.x + 4, this.y - 128);
        }
    }

    public startDialog(): void {
        this.speechBubble.update(this.x, this.y);
    }
}
