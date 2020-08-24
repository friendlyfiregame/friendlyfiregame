import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { entity } from './Entity';
import { EyeType, Face } from './Face';
import { GameScene } from './scenes/GameScene';
import { NPC } from './NPC';
import { Point } from './geometry/Point';
import { QuestATrigger, QuestKey } from './Quests';
import { RenderingLayer } from './Renderer';
import { Seed } from './Seed';
import { Size } from './geometry/Size';
import { Wood } from './Wood';

@entity("tree")
export class Tree extends NPC {
    @asset("sprites/tree.aseprite.json")
    private static sprite: Aseprite;

    public seed: Seed;
    private wood: Wood;

    public constructor(scene: GameScene, position: Point) {
        super(scene, position, new Size(78, 140));

        this.face = new Face(scene, this, EyeType.TREE, 5, 94);
        this.seed = new Seed(scene, position.clone());
        this.wood = new Wood(scene, position.clone());

        this.startDialog();
    }

    public showDialoguePrompt(): boolean {
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

    public draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(Tree.sprite, "idle", this.position, RenderingLayer.ENTITIES);

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        this.drawFace(ctx);

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }

        this.speechBubble.draw(ctx);
    }

    public update(dt: number): void {
        super.update(dt);

        if (this.showDialoguePrompt()) {
            this.dialoguePrompt.update(dt, this.position.clone().moveBy(4, 128));
        }
    }

    public startDialog(): void {
        this.speechBubble.update(this.position);
    }

    public spawnSeed(): Seed {
        if (!this.scene.gameObjects.includes(this.seed)) {
            this.scene.addGameObject(this.seed);
        }

        this.seed.position.moveTo(this.position.clone().moveYBy(this.size.height / 2));
        this.seed.setVelocity(5, 0);

        return this.seed;
    }

    public spawnWood(): Wood {
        if (!this.scene.gameObjects.includes(this.wood)) {
            this.scene.addGameObject(this.wood);
        }

        this.wood.position.moveTo(this.position.clone().moveYBy(this.size.height / 2));
        this.wood.setVelocity(5, 0);

        return this.wood;
    }
}
