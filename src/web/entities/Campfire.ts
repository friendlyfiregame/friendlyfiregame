import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity, entity } from "../Entity";
import { RenderingLayer } from "../Renderer";
import { GameScene } from "../scenes/GameScene";

@entity("campfire")
export class Campfire extends Entity {
    @asset("sprites/campfire.aseprite.json")
    private static readonly sprite: Aseprite;

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

    public override update(): void {}
}
