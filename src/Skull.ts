import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { entity } from './Entity';
import { GameScene } from './scenes/GameScene';
import { PhysicsEntity } from './PhysicsEntity';
import { Point, Size } from './Geometry';
import { RenderingLayer } from './Renderer';

@entity("skull")
export class Skull extends PhysicsEntity {
    @asset("sprites/skull.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, position: Point) {
        super(scene, position, new Size(16, 16));
    }

    draw(): void {
        this.scene.renderer.addAseprite(Skull.sprite, "idle", this.position, RenderingLayer.ENTITIES);
        if (this.scene.showBounds) this.drawBounds();
    }

    public isCarried(): boolean {
        return this.scene.player.isCarrying(this);
    }

    update(dt: number): void {
        super.update(dt);
        const player = this.scene.player;
        if (!this.isCarried() && this.distanceTo(player) < 20) {
            player.carry(this);
        }
    }
}
