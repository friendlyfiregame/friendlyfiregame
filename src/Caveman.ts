import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import { RenderingLayer } from "./RenderingLayer";

@entity("caveman")
export class Caveman extends NPC {
    @asset("sprites/caveman.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 18, 24);
        this.setLayer(RenderingLayer.ENTITIES);
    }

    public showDialoguePrompt(): boolean {
        return false;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.scale(this.direction, 1);
        Caveman.sprite.drawTag(ctx, "idle", -Caveman.sprite.width >> 1, -Caveman.sprite.height);
        ctx.restore();
    }
}
