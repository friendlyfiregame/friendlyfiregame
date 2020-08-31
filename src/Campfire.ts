import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { entity, Entity } from './Entity';
import { GameScene } from './scenes/GameScene';
import { RenderingLayer } from './Renderer';

@entity("campfire")
export class Campfire extends Entity {
    @asset("sprites/campfire.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 14, 28, false);
    }

    public draw(): void {
        this.scene.renderer.addAseprite(
            Campfire.sprite,
            "idle",
            this.x, this.y - 2,
            RenderingLayer.ENTITIES
        );

        if (this.scene.showBounds) {
            this.drawBounds();
        }
    }

    public update(): void {}
}
