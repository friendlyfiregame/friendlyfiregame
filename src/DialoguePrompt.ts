import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { RenderingLayer } from "./RenderingLayer";
import { SceneNode } from "./scene/SceneNode";

export class DialoguePrompt extends SceneNode {
    @asset("sprites/dialogue.aseprite.json")
    private static sprite: Aseprite;

    private offsetX = 0;
    private offsetY = 0;
    private timeAlive = 0;
    private floatAmount = 2;
    private floatSpeed = 5;

    public constructor() {
        super();
        this.setLayer(RenderingLayer.ENTITIES);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;
        DialoguePrompt.sprite.drawTag(ctx, "idle", -DialoguePrompt.sprite.width >> 1 - this.offsetX,
            -DialoguePrompt.sprite.height - this.offsetY + floatOffsetY);
    }

    public update(dt: number) {
        this.timeAlive += dt;
    }

    public updatePosition(anchorX: number, anchorY: number): void {
        this.offsetX = anchorX;
        this.offsetY = anchorY;
    }
}
