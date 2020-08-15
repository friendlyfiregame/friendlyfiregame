import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { Entity } from './Entity';
import { GameObjectProperties } from './MapInfo';
import { GameScene } from './scenes/GameScene';
import { Point, Size } from './Geometry';
import { RenderingLayer } from './Renderer';

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

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.scene.mountainRiddle.isCorrectGate(this.col, this.row)) {
            this.scene.renderer.addAseprite(RiddleStone.sprite, "idle", this.position, RenderingLayer.ENTITIES)
            if (this.scene.showBounds) this.drawBounds();
        }
    }

    update(dt: number): void {}
}
