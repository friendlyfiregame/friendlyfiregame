import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { entity, Entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { RenderingLayer } from "./RenderingLayer";

@entity("radio")
export class Radio extends Entity {
    @asset("sprites/radio.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 24, 24, false);
        this.setLayer(RenderingLayer.ENTITIES);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        Radio.sprite.drawTag(ctx, "idle", -Radio.sprite.width >> 1, -Radio.sprite.height);
    }

    public update(): void {
        // Intentionally not calling parent to disable physics
    }
}
