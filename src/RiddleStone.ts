import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { Entity } from "./Entity";
import { GameObjectProperties } from "./MapInfo";
import { GameScene } from "./scenes/GameScene";
import { RenderingLayer } from "./RenderingLayer";

export class RiddleStone extends Entity {
    @asset("sprites/riddlestone.aseprite.json")
    private static sprite: Aseprite;
    private col: number;
    private row: number;

    public constructor(scene: GameScene, x: number, y: number, properties: GameObjectProperties) {
        super(scene, x, y, 16, 16, false);
        this.setLayer(RenderingLayer.ENTITIES);
        this.col = properties.col || 0;
        this.row = properties.row || 0;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.scene.mountainRiddle.isCorrectGate(this.col, this.row)) {
            RiddleStone.sprite.drawTag(ctx, "idle", -RiddleStone.sprite.width >> 1, -RiddleStone.sprite.height);
        }
    }

    public update(): void {}
}
