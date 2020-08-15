import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { entity } from './Entity';
import { GameScene } from './scenes/GameScene';
import { NPC } from './NPC';
import { Point, Size } from './Geometry';
import { RenderingLayer } from './Renderer';

@entity("caveman")
export class Caveman extends NPC {
    @asset("sprites/caveman.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, position: Point) {
        super(scene, position, new Size(18, 24));
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(Caveman.sprite, "idle", this.position, RenderingLayer.ENTITIES, this.direction)
        if (this.scene.showBounds) this.drawBounds();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.position);
    }
}
