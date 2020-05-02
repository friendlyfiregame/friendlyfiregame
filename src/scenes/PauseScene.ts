import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { SlideTransition } from "../transitions/SlideTransition";
import { easeOutBounce } from "../easings";
import { BitmapFont } from "../BitmapFont";
import { asset } from "../Assets";

export class PauseScene extends Scene<FriendlyFire> {
    @asset("fonts/standard.font.json")
    private static font: BitmapFont;

    public setup(): void {
        this.inTransition = new SlideTransition({ duration: 1, direction: "top", easing: easeOutBounce });
        this.outTransition = new SlideTransition({ duration: 0.25 });
    }

    public activate(): void {
        this.keyboard.onKeyDown.connect(this.handleKeyDown, this);
    }

    public deactivate(): void {
        this.keyboard.onKeyDown.disconnect(this.handleKeyDown, this);
    }

    private handleKeyDown(event: KeyboardEvent): void {
        this.scenes.popScene();
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);
        ctx.font = "20px sans-serif";
        ctx.fillStyle = "white";
        const text = "Pause - Press any key to continue";
        const metrics = PauseScene.font.measureText(text);
        PauseScene.font.drawText(ctx, text, (width - metrics.width) >> 1, (height - metrics.height) >> 1, "white");
        ctx.restore();
    }
}
