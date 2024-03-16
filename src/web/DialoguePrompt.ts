import { type Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { Entity, type EntityArgs } from "./Entity";
import { Direction } from "./geom/Direction";
import { RenderingLayer } from "./Renderer";
import { AsepriteNode } from "./scene/AsepriteNode";

export class DialoguePrompt extends Entity {
    @asset("sprites/dialogue.aseprite.json")
    private static readonly sprite: Aseprite;

    private readonly floatAmount = 2;
    private readonly floatSpeed = 5;
    private readonly asepriteNode: AsepriteNode;

    public constructor(args: EntityArgs) {
        super({ hidden: true, ...args });
        this.asepriteNode = new AsepriteNode({
            aseprite: DialoguePrompt.sprite,
            tag: "idle",
            layer: RenderingLayer.UI,
            anchor: Direction.BOTTOM
        }).appendTo(this);
    }

    public override update(dt: number): void {
        super.update(dt);
        this.asepriteNode.setY(1 - Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount);
    }
}
