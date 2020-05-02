import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { asset } from "../Assets";
import { FadeTransition } from "../transitions/FadeTransition";
import { CurtainTransition } from "../transitions/CurtainTransition";
import { easeInSine } from "../easings";

export class StartScene extends Scene<FriendlyFire> {
    @asset("images/title.png")
    private static titleImage: HTMLImageElement;

    public setup(): void {
        this.inTransition = new FadeTransition();
        this.outTransition = new CurtainTransition({ easing: easeInSine });
    }

    public activate(): void {
        this.keyboard.onKeyDown.connect(this.handleKeyDown, this);
    }

    public deactivate(): void {
        this.keyboard.onKeyDown.disconnect(this.handleKeyDown, this);
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (event.code === "Enter") {
            console.log("Start");
        }
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();
        ctx.drawImage(StartScene.titleImage, 0, 0);
        ctx.restore();
    }
}
