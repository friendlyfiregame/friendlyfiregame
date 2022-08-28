import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import { PhysicsEntity } from "./PhysicsEntity";
import { RenderingLayer } from "../Renderer";
import { LevelId } from "../Levels";

@entity("skull")
export class Skull extends PhysicsEntity {
    @asset("sprites/skull.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y: number, levelId: LevelId) {
        super(scene, x, y, 16, 16, levelId);
    }

    public draw(): void {
        this.scene.renderer.addAseprite(Skull.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES);

        if (this.scene.showBounds) {
            this.drawBounds();
        }
    }

    public isCarried(): boolean {
        return this.scene.player.isCarrying(this);
    }

    public update(dt: number): void {
        super.update(dt);

        const player = this.scene.player;

        if (!this.isCarried() && this.distanceTo(player) < 20) {
            player.carry(this);
        }
    }
}
