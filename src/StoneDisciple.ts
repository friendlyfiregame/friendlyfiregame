import { NPC } from './NPC';
import { entity } from "./Entity";
import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";

@entity("stonedisciple")
export class StoneDisciple extends NPC {
    @asset("sprites/stonedisciple.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 32, 26);
        this.direction = -1;
        this.lookAtPlayer = true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }
        StoneDisciple.sprite.drawTag(ctx, "idle", -StoneDisciple.sprite.width >> 1, -StoneDisciple.sprite.height, this.scene.gameTime * 1000);
        ctx.restore();
        if (this.scene.showBounds) this.drawBounds(ctx);
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
    }
}
