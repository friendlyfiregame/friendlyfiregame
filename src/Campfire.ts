import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { entity, Entity } from './Entity';
import { GameScene } from './scenes/GameScene';
import { Point } from './geometry/Point';
import { RenderingLayer } from './Renderer';
import { Size } from './geometry/Size';

@entity("campfire")
export class Campfire extends Entity {
    @asset("sprites/campfire.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, position: Point) {
        super(scene, position, new Size(14, 28), false);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(Campfire.sprite, "idle", new Point(this.position.x, this.position.y - 2), RenderingLayer.ENTITIES)
        if (this.scene.showBounds) this.drawBounds();
    }

    public update(): void {}
}
