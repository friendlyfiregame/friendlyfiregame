import { entity } from "./Entity";
import { Game } from "./game";
import { Sprites, getSpriteIndex } from "./Sprites";
import { loadImage } from "./graphics";
import { TREE_ANIMATION } from "./constants";
import { Face, EyeType } from './Face';
import { NPC } from './NPC';

@entity("tree")
export class Tree extends NPC {
    private sprites!: Sprites;
    private spriteIndex = 0;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 26, 54);
        this.face = new Face(this, EyeType.TREE, 1, 5, 94);
    }

    public async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/tree.png"), 2, 1);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        this.sprites.draw(ctx, this.spriteIndex);
        ctx.restore();
        this.drawFace(ctx);
    }

    update(dt: number): void {
        this.spriteIndex = getSpriteIndex(0, TREE_ANIMATION);
    }
    startDialog(): void {
    }
}
