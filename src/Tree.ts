
import { Face, EyeType } from './Face';
import { Game } from "./game";
import { NPC } from './NPC';
import { Sprites, getSpriteIndex } from "./Sprites";
import { TREE_ANIMATION } from "./constants";
import { entity } from "./Entity";
import { loadImage } from "./graphics";
import { Seed } from "./Seed";

@entity("tree")
export class Tree extends NPC {
    private sprites!: Sprites;
    private spriteIndex = 0;
    public seed: Seed;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 78, 140);
        this.face = new Face(this, EyeType.TREE, 1, 5, 94);
        this.seed = new Seed(game, x, y);
        this.startDialog();
    }

    public async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/tree.png"), 2, 1);
        await this.seed.load();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        this.sprites.draw(ctx, this.spriteIndex);
        ctx.restore();
        this.drawFace(ctx);
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        this.spriteIndex = getSpriteIndex(0, TREE_ANIMATION);
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
}
