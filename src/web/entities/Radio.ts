import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity, entity, type EntityArgs } from "../Entity";
import { RenderingLayer } from "../Renderer";

@entity("radio")
export class Radio extends Entity {
    @asset("sprites/radio.aseprite.json")
    private static readonly sprite: Aseprite;

    public constructor(args: EntityArgs) {
        super({ width: 24, height: 24, ...args, isTrigger: false });
    }

    public override draw(): void {
        this.scene.renderer.addAseprite(Radio.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES);
    }

    public override update(): void {}
}
