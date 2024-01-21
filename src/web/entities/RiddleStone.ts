import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity, entity, type EntityArgs } from "../Entity";
import { RenderingLayer } from "../Renderer";

@entity("riddlestone")
export class RiddleStone extends Entity {
    @asset("sprites/riddlestone.aseprite.json")
    private static readonly sprite: Aseprite;
    private readonly col: number;
    private readonly row: number;

    public constructor(args: EntityArgs) {
        super({ width: 16, height: 16,  isTrigger: false, ...args });

        this.col = this.properties?.col ?? 0;
        this.row = this.properties?.row ?? 0;
    }

    public draw(): void {
        if (this.scene.mountainRiddle.isCorrectGate(this.col, this.row)) {
            this.scene.renderer.addAseprite(RiddleStone.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES);

            if (this.scene.showBounds) {
                this.drawBounds();
            }
        }
    }

    public override update(): void {}
}
