import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { SlideTransition } from "../transitions/SlideTransition";
import { easeOutCubic } from "../easings";
import { BitmapFont } from "../BitmapFont";
import { asset } from "../Assets";
import { ControllerEvent } from "../input/ControllerEvent";

export class ControlsScene extends Scene<FriendlyFire> {
    @asset("fonts/standard.font.json")
    private static font: BitmapFont;

    @asset("images/controls.png")
    private static panelImage: HTMLImageElement;

    public setup(): void {
        this.zIndex = 2;
        this.inTransition = new SlideTransition({ duration: 0.5, direction: "top", easing: easeOutCubic });
        this.outTransition = new SlideTransition({ duration: 0.25 });
    }

    public activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
    }

    public deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
    }

    private handleButtonDown(event: ControllerEvent): void {
        this.scenes.popScene();
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();

        const x = (width / 2) - ControlsScene.panelImage.width / 2;
        const y = (height / 2) - ControlsScene.panelImage.height / 2;
        const textOffsetX = 10;
        ctx.translate(x, y);

        ctx.drawImage(ControlsScene.panelImage, 0, 0);
        ctx.font = "20px sans-serif";
        ctx.fillStyle = "white";

        // ctx.translate((width / 2) - ControlsScene.panelImage.width, (height / 2) - ControlsScene.panelImage.height);

        ControlsScene.font.drawText(ctx, 'Walk around and', textOffsetX, 25, "black");
        ControlsScene.font.drawText(ctx, 'Navigate menus', textOffsetX, 35, "black");
        ControlsScene.font.drawText(ctx, 'Jump', textOffsetX, 70, "black");
        ControlsScene.font.drawText(ctx, 'Interact and Confirm', textOffsetX, 110, "black");
        ControlsScene.font.drawText(ctx, 'Pause and Cancel', textOffsetX, 135, "black");
        ctx.restore();
    }
}
