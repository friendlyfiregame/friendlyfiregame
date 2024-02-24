import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity, entity, type EntityArgs } from "../Entity";
import { Direction } from "../geom/Direction";
import { RenderingLayer } from "../Renderer";
import { AsepriteNode } from "../scene/AsepriteNode";

@entity("Campfire")
export class Campfire extends Entity {
    @asset("sprites/campfire.aseprite.json")
    private static readonly sprite: Aseprite;

    public constructor(args: EntityArgs) {
        super({
            ...args,
            width: Campfire.sprite.width,
            height: Campfire.sprite.height,
            isTrigger: false,
            reversed: true
        });
        this.appendChild(new AsepriteNode({
            aseprite: Campfire.sprite,
            layer: RenderingLayer.ENTITIES,
            anchor: Direction.BOTTOM,
            y: 2
        }));
    }
}
