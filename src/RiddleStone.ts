import { entity, Entity } from "./Entity";
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { GameObjectProperties } from './MapInfo';

@entity("riddlestone")
export class RiddleStone extends Entity {
    @asset("sprites/riddlestone.aseprite.json")
    private static sprite: Aseprite;
    private col: number;
    private row: number;

    public constructor(scene: GameScene, x: number, y:number, properties: GameObjectProperties) {
        super(scene, x, y, 16, 16, false);
        this.col = properties.col || 0;
        this.row = properties.row || 0;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.scene.mountainRiddle.isCorrectGate(this.col, this.row)) {
            ctx.save();
            ctx.translate(this.x, -this.y);
            RiddleStone.sprite.drawTag(ctx, "idle", -RiddleStone.sprite.width >> 1, -RiddleStone.sprite.height,
                this.scene.gameTime * 1000);
            ctx.restore();
            if (this.scene.showBounds) this.drawBounds(ctx);
        }
    }

    update(dt: number): void {}
}
