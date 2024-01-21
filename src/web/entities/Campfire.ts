import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity, entity, type EntityArgs } from "../Entity";
import { RenderingLayer } from "../Renderer";

@entity("campfire")
export class Campfire extends Entity {
    @asset("sprites/campfire.aseprite.json")
    private static readonly sprite: Aseprite;

    public constructor(args: EntityArgs) {
        super({ width: 14, height: 28, isTrigger: false, ...args });
    }

    public draw(): void {
        this.scene.renderer.addAseprite(
            Campfire.sprite,
            "idle",
            this.x, this.y - 2,
            RenderingLayer.ENTITIES
        );

        if (this.scene.showBounds) {
            this.drawBounds();
        }
    }

    public override update(): void {}
}
