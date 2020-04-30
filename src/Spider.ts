import { Game } from "./game";
import { NPC } from './NPC';
import { SPIDER_IDLE_ANIMATION } from "./constants";
import { Sprites, getSpriteIndex } from "./Sprites";
import { entity } from "./Entity";
import { loadImage } from "./graphics";

@entity("spider")
export class Spider extends NPC {
    private sprites!: Sprites;
    private spriteIndex = 0;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 36, 36);
        this.direction = -1;
    }

    public async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/magicspider.png"), 4, 1);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }
        this.sprites.draw(ctx, this.spriteIndex);
        ctx.restore();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        this.spriteIndex = getSpriteIndex(0, SPIDER_IDLE_ANIMATION);
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
    }
}
