import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity, entity, type EntityArgs } from "../Entity";
import { Direction } from "../geom/Direction";
import { RenderingLayer } from "../Renderer";
import { AsepriteNode } from "../scene/AsepriteNode";

@entity("Radio")
export class Radio extends Entity {
    @asset("sprites/radio.aseprite.json")
    private static readonly sprite: Aseprite;

    public constructor(args: EntityArgs) {
        super({ width: 24, height: 24, ...args, isTrigger: false });
        this.appendChild(new AsepriteNode({
            aseprite: Radio.sprite,
            tag: "idle",
            layer: RenderingLayer.ENTITIES,
            anchor: Direction.BOTTOM
        }));
    }
}
