import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity, entity, type EntityArgs } from "../Entity";
import { RenderingLayer } from "../Renderer";

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
        super({ ...args, width: 16, height: 16,  isTrigger: false });
        this.col = col;
        this.row = row;
    }

    public override draw(): void {
        if (this.scene.mountainRiddle.isCorrectGate(this.col, this.row)) {
            this.scene.renderer.addAseprite(RiddleStone.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES);
        }
    }

    public override update(): void {}
}
