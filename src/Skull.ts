import { entity } from "./Entity";
import { PhysicsEntity } from "./PhysicsEntity";
import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";

@entity("skull")
export class Skull extends PhysicsEntity {
    @asset("sprites/skull.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 16, 16);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        Skull.sprite.drawTag(ctx, "idle", -Skull.sprite.width >> 1, -Skull.sprite.height, this.scene.gameTime * 1000);
        ctx.restore();
        if (this.scene.showBounds) this.drawBounds(ctx);
    }

    public isCarried(): boolean {
        return this.scene.player.isCarrying(this);
    }

    update(dt: number): void {
        super.update(dt);
        const player = this.scene.player;
        if (!this.isCarried() && this.distanceTo(player) < 20) {
            player.carry(this);
        }
    }
}
