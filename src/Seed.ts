import { entity } from "./Entity";
import { Game } from "./game";
import { Sprites } from "./Sprites";
import { loadImage } from "./graphics";
import { Face, EyeType } from './Face';
import { NPC } from './NPC';

@entity("seed")
export class Seed extends NPC {
    private sprites!: Sprites;
    private spriteIndex = 0;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 24, 24);
        this.face = new Face(this, EyeType.STANDARD, 1, -4, 8);
    }

    public async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/seed.png"), 2, 1);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save(); 
        ctx.translate(this.x, -this.y + 1);
        this.sprites.draw(ctx, this.spriteIndex);
        ctx.restore();
        // this.spriteIndex = 1;
        // this.drawFace(ctx);
    }

    update(dt: number): void {
        // this.spriteIndex = getSpriteIndex(0, TREE_ANIMATION);
    }
    startDialog(): void {
    }
}
