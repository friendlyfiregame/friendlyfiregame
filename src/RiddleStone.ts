import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { Entity } from "./Entity";
import { GameObjectProperties } from "./MapInfo";
import { GameScene } from "./scenes/GameScene";
import { RenderingLayer } from "./Renderer";

export class RiddleStone extends Entity {
    @asset("sprites/riddlestone.aseprite.json")
    private static sprite: Aseprite;
    private col: number;
    private row: number;

    public constructor(scene: GameScene, x: number, y: number, properties: GameObjectProperties) {
        super(scene, x, y, 16, 16, false);

        this.col = properties.col || 0;
        this.row = properties.row || 0;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.scene.mountainRiddle.isCorrectGate(this.col, this.row)) {
            this.scene.renderer.drawAseprite(ctx, RiddleStone.sprite, "idle", 0, 0, RenderingLayer.ENTITIES);
        }
    }

    public update(): void {}
}
