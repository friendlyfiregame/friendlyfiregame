import { entity } from "./Entity";
import { Game } from "./game";
import { NPC } from './NPC';
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";

@entity("wing")
export class Wing extends NPC {
    @asset("sprites/wing.aseprite.json")
    private static sprite: Aseprite;

    private timeAlive = 0;

    private floatAmount = 4;
    private floatSpeed = 2;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 24, 24);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;
        ctx.translate(this.x, -this.y - floatOffsetY);
        Wing.sprite.drawTag(ctx, "idle", -Wing.sprite.width >> 1, -Wing.sprite.height);
        ctx.restore();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.timeAlive += dt;
        this.speechBubble.update(this.x, this.y);
    }
}
