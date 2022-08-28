import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity, Entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import { RenderingLayer } from "../Renderer";
import { LevelId } from "../Levels";

@entity("campfire")
export class Campfire extends Entity {
    @asset("sprites/campfire.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y: number, levelId: LevelId) {
        super(scene, x, y, 14, 28, levelId, false);
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
