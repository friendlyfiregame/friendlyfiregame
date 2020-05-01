import { Aseprite } from "./Aseprite";

export class DialoguePrompt {
    private static sprite: Aseprite;
    private x: number;
    private y: number;
    private timeAlive = 0;
    private flaotAmount = 2;
    private floatSpeed = 5;

    public constructor(x: number, y:number) {
        this.x = x;
        this.y = y;
    }

    public static async load(): Promise<void> {
        console.log('loadng dialoginfo');
        DialoguePrompt.sprite = await Aseprite.load("assets/sprites/dialogue.aseprite.json");
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.flaotAmount;
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
