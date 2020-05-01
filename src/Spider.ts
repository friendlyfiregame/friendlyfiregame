import { Game } from "./game";
import { NPC } from './NPC';
import { entity } from "./Entity";
import { Aseprite } from "./Aseprite";

@entity("spider")
export class Spider extends NPC {
    private sprite!: Aseprite;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 36, 36);
        this.direction = -1;
    }

    public async load(): Promise<void> {
        this.sprite = await Aseprite.load("assets/sprites/magicspider.aseprite.json");
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }
        this.sprite.drawTag(ctx, "idle", -this.sprite.width >> 1, -this.sprite.height);
        ctx.restore();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
    }
}
