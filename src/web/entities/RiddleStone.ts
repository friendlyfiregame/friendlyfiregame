import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity } from "../Entity";
import { GameObjectProperties } from "../MapInfo";
import { GameScene } from "../scenes/GameScene";
import { RenderingLayer } from "../Renderer";
import { LevelId } from "../Levels";

export class RiddleStone extends Entity {
    @asset("sprites/riddlestone.aseprite.json")
    private static sprite: Aseprite;
    private col: number;
    private row: number;

    public constructor(scene: GameScene, x: number, y: number, levelId: LevelId, properties: GameObjectProperties) {
        super(scene, x, y, 16, 16, levelId, false);

        this.col = properties.col || 0;
        this.row = properties.row || 0;
    }

    public draw(): void {
        if (this.scene.mountainRiddle.isCorrectGate(this.col, this.row)) {
            this.scene.renderer.addAseprite(RiddleStone.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES);

            if (this.scene.showBounds) {
                this.drawBounds();
            }
        }
    }

    public update(): void {}
}
