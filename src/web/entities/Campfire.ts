import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity, entity, type EntityArgs } from "../Entity";
import { RenderingLayer } from "../Renderer";

@entity("Campfire")
export class Campfire extends Entity {
    @asset("sprites/campfire.aseprite.json")
    private static readonly sprite: Aseprite;

    public constructor(args: EntityArgs) {
        super({
            ...args,
            width: 14,
            height: 32,
            isTrigger: false,
            reversed: true,
            layer: RenderingLayer.ENTITIES,
        });
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        Campfire.sprite.drawTag(ctx, "idle", 0, 2, this.scene.gameTime * 1000);
    }
}
