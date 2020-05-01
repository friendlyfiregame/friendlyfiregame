
import { Face, EyeType } from './Face';
import { Game } from "./game";
import { NPC } from './NPC';
import { entity } from "./Entity";
import { Seed } from "./Seed";
import { Wood } from './Wood';
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";

@entity("tree")
export class Tree extends NPC {
    @asset("sprites/tree.aseprite.json")
    private static sprite: Aseprite;

    public seed: Seed;
    private wood: Wood;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 78, 140);
        this.face = new Face(this, EyeType.TREE, 5, 94);
        this.seed = new Seed(game, x, y);
        this.wood = new Wood(game, x, y);
        this.startDialog();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        Tree.sprite.drawTag(ctx, "idle", -Tree.sprite.width >> 1, -Tree.sprite.height);
        ctx.restore();
        this.drawFace(ctx);
        this.speechBubble.draw(ctx);
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
