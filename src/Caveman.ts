import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import { RenderingLayer } from "./Renderer";

@entity("caveman")
export class Caveman extends NPC {
    @asset("sprites/caveman.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 18, 24);
        this.setLayer(RenderingLayer.ENTITIES);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.drawAseprite(
            ctx,
            Caveman.sprite,
            "idle",
            0, 0,
            this.direction
        );

        this.speechBubble.draw(ctx);
    }
}
