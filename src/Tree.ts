
import { Face, EyeType } from './Face';
import { Game } from "./game";
import { NPC } from './NPC';
import { entity } from "./Entity";
import { Seed } from "./Seed";
import { Wood } from './Wood';
import { Aseprite } from './Aseprite';
import { Milestone } from './Player';

@entity("tree")
export class Tree extends NPC {
    private sprite!: Aseprite;
    public seed: Seed;
    private wood: Wood;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 78, 140);
        this.face = new Face(this, EyeType.TREE, 1, 5, 94);
        this.seed = new Seed(game, x, y);
        this.wood = new Wood(game, x, y);
        this.startDialog();
    }

    public async load(): Promise<void> {
        this.sprite = await Aseprite.load("assets/sprites/tree.aseprite.json");
        await this.seed.load();
        await this.wood.load();
    }

    public showDialoguePrompt (): boolean {
        return (
            this.game.player.getMilestone() >= Milestone.GOT_QUEST_FROM_FIRE &&
            this.game.player.getMilestone() < Milestone.GOT_QUEST_FROM_TREE
        ) || (
            this.game.player.getMilestone() >= Milestone.MADE_RAIN &&
            this.game.player.getMilestone() < Milestone.TREE_DROPPED_WOOD
        );
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        this.sprite.drawTag(ctx, "idle", -this.sprite.width >> 1, -this.sprite.height);
        ctx.restore();
        this.drawFace(ctx);
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        if (this.showDialoguePrompt()) {
            this.dialoguePrompt.update(dt, this.x + 4, this.y + 128);
        }
    }

    startDialog(): void {
        this.speechBubble.update(this.x, this.y);
    }

    public spawnSeed(): Seed {
        if (!this.game.gameObjects.includes(this.seed)) {
            this.game.addGameObject(this.seed);
        }
        this.seed.x = this.x;
        this.seed.y = this.y + this.height / 2;
        this.seed.setVelocity(5, 0);
        return this.seed;
    }

    public spawnWood(): Wood {
        if (!this.game.gameObjects.includes(this.wood)) {
            this.game.addGameObject(this.wood);
        }
        this.wood.x = this.x;
        this.wood.y = this.y + this.height / 2;
        this.wood.setVelocity(5, 0);
        return this.wood;
    }
}
