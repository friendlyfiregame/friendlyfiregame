import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity, entity, type EntityArgs } from "../Entity";
import { RenderingLayer } from "../Renderer";

@entity("Campfire")
export class Campfire extends Entity {
    @asset("sprites/campfire.aseprite.json")
    private static readonly sprite: Aseprite;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 14, height: 28, isTrigger: false, reversed: true });
    }

    public override render(): void {
        this.scene.renderer.addAseprite(
            Campfire.sprite,
            "idle",
            this.x, this.y + 2,
            RenderingLayer.ENTITIES
        );
    }

    public override update(): void {}
}
