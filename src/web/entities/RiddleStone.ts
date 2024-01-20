import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity } from "../Entity";
import { type GameObjectProperties } from "../MapInfo";
import { RenderingLayer } from "../Renderer";
import { type GameScene } from "../scenes/GameScene";

export class RiddleStone extends Entity {
    @asset("sprites/riddlestone.aseprite.json")
    private static readonly sprite: Aseprite;
    private readonly col: number;
    private readonly row: number;

    public constructor(scene: GameScene, x: number, y: number, properties: GameObjectProperties) {
        super(scene, x, y, 16, 16, false);

        this.col = properties.col ?? 0;
        this.row = properties.row ?? 0;
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
