import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { Entity } from './Entity';
import { GameObjectProperties } from './MapInfo';
import { GameScene } from './scenes/GameScene';
import { Point } from './geometry/Point';
import { RenderingLayer } from './Renderer';
import { Size } from './geometry/Size';

export class RiddleStone extends Entity {
    @asset("sprites/riddlestone.aseprite.json")
    private static sprite: Aseprite;
    private col: number;
    private row: number;

    public constructor(scene: GameScene, position: Point, properties: GameObjectProperties) {
        super(scene, position, new Size(16, 16), false);

        this.col = properties.col || 0;
        this.row = properties.row || 0;
    }

    public draw(): void {
        if (this.scene.mountainRiddle.isCorrectGate(this.col, this.row)) {
            this.scene.renderer.addAseprite(RiddleStone.sprite, "idle", this.position, RenderingLayer.ENTITIES)

            if (this.scene.showBounds) {
                this.drawBounds();
            }
        }
    }

    public update(): void {}
}
