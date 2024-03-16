import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity, entity, type EntityArgs } from "../Entity";
import { Direction } from "../geom/Direction";
import { RenderingLayer } from "../Renderer";
import { AsepriteNode } from "../scene/AsepriteNode";

/** Riddle stone constructor arguments. */
export interface RiddleStoneArgs extends EntityArgs {
    /** The column of this riddle stone. Defaults to 0. */
    col?: number;

    /** The row of this riddle stone. Defaults to 0. */
    row?: number;
}

@entity("RiddleStone")
export class RiddleStone extends Entity {
    @asset("sprites/riddlestone.aseprite.json")
    private static readonly sprite: Aseprite;
    private readonly col: number;
    private readonly row: number;

    public constructor({ col = 0, row = 0, ...args }: RiddleStoneArgs) {
        super({ ...args, width: 16, height: 16, isTrigger: false, reversed: true });
        this.col = col;
        this.row = row;
        this.appendChild(new AsepriteNode({
            aseprite: RiddleStone.sprite,
            tag: "idle",
            layer: RenderingLayer.ENTITIES,
            anchor: Direction.BOTTOM,
        }));
    }

    public override update(): void {
        this.setVisible(this.scene.mountainRiddle.isCorrectGate(this.col, this.row));
    }
}
