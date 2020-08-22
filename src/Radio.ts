import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { entity, Entity } from './Entity';
import { GameScene } from './scenes/GameScene';
import { RenderingLayer } from './Renderer';

@entity("radio")
export class Radio extends Entity {
    @asset("sprites/radio.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 24, 24, false);
    }

    draw(): void {
        this.scene.renderer.addAseprite(Radio.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES)
        if (this.scene.showBounds) this.drawBounds();
    }

    update(dt: number): void {}
}
