import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { entity } from './Entity';
import { GameScene } from './scenes/GameScene';
import { NPC } from './NPC';
import { RenderingLayer } from './Renderer';

@entity("caveman")
export class Caveman extends NPC {
    @asset("sprites/caveman.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 18, 24);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(
            Caveman.sprite,
            "idle",
            this.x, this.y,
            RenderingLayer.ENTITIES,
            this.direction
        );

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        this.speechBubble.draw(ctx);
    }

    public update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
    }
}
