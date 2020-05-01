import { Game } from "./game";
import { NPC } from './NPC';
import { entity } from "./Entity";
import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";

@entity("spider")
export class Spider extends NPC {
    @asset("sprites/magicspider.aseprite.json")
    private static sprite: Aseprite;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 36, 36);
        this.direction = -1;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }
        Spider.sprite.drawTag(ctx, "idle", -Spider.sprite.width >> 1, -Spider.sprite.height);
        ctx.restore();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
    }
}
