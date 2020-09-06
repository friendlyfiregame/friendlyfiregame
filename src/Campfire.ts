import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { entity, Entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { RenderingLayer } from "./Renderer";

@entity("campfire")
export class Campfire extends Entity {
    @asset("sprites/campfire.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 14, 28, false);
        this.setLayer(RenderingLayer.ENTITIES);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        Campfire.sprite.drawTag(ctx, "idle", -Campfire.sprite.width >> 1, -Campfire.sprite.height + 2);
    }

    public update(): void {}
}
