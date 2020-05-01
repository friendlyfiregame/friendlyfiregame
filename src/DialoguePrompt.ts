import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";

export class DialoguePrompt {
    @asset("sprites/dialogue.aseprite.json")
    private static sprite: Aseprite;

    private x: number;
    private y: number;
    private timeAlive = 0;
    private floatAmount = 2;
    private floatSpeed = 5;

    public constructor(x: number, y:number) {
        this.x = x;
        this.y = y;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;
        ctx.translate(this.x, -this.y - floatOffsetY);
        DialoguePrompt.sprite.drawTag(ctx, "idle", -DialoguePrompt.sprite.width >> 1, -DialoguePrompt.sprite.height);
        ctx.restore();
    }

    update(dt: number, anchorX: number, anchorY: number): void {
        this.timeAlive += dt;
        this.x = anchorX;
        this.y = anchorY;
    }
}
