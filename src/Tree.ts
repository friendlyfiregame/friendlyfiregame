import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { entity } from "./Entity";
import { EyeType, Face } from "./Face";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import { QuestATrigger, QuestKey } from "./Quests";
import { RenderingLayer } from "./RenderingLayer";
import { Seed } from "./Seed";
import { Wood } from "./Wood";

@entity("tree")
export class Tree extends NPC {
    @asset("sprites/tree.aseprite.json")
    private static sprite: Aseprite;

    public seed: Seed;
    private wood: Wood;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 78, 140);
        this.setLayer(RenderingLayer.ENTITIES);
        this.face = new Face(scene, EyeType.TREE, false, 5, 94).appendTo(this);
        this.seed = new Seed(scene, x, y);
        this.wood = new Wood(scene, x, y);
    }

    public showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        return (
            this.gameScene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.GOT_QUEST_FROM_FIRE
            && this.gameScene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.GOT_QUEST_FROM_TREE
        ) || (
            this.gameScene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.MADE_RAIN
            && this.gameScene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.TREE_DROPPED_WOOD
        );
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        Tree.sprite.drawTag(ctx, "idle", -Tree.sprite.width >> 1, -Tree.sprite.height);
    }

    public update(dt: number): void {
        super.update(dt);
        this.dialoguePrompt.updatePosition(4, 128);
    }

    public spawnSeed(): Seed {
        if (!this.seed.isInScene()) {
            this.gameScene.addGameObject(this.seed);
        }

        this.seed.x = this.x;
        this.seed.y = this.y + this.height / 2;
        this.seed.setVelocity(5, 0);

        return this.seed;
    }

    public spawnWood(): Wood {
        if (!this.wood.isInScene()) {
            this.gameScene.addGameObject(this.wood);
        }

        this.wood.x = this.x;
        this.wood.y = this.y + this.height / 2;
        this.wood.setVelocity(5, 0);

        return this.wood;
    }
}
