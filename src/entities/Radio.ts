import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity, Entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import { RenderingLayer } from "../Renderer";
import { LevelId } from "../Levels";

@entity("radio")
export class Radio extends Entity {
    @asset("sprites/radio.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y: number, levelId: LevelId) {
        super(scene, x, y, 24, 24, levelId, false);
    }

    public draw(): void {
        this.scene.renderer.addAseprite(Radio.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES);

        if (this.scene.showBounds) {
            this.drawBounds();
        }
    }

    public update(): void {}
}
