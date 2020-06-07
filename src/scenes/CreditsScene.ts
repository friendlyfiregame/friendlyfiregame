import { Scene } from '../Scene';
import { FriendlyFire } from '../FriendlyFire';
import { asset } from '../Assets';
import { BitmapFont } from '../BitmapFont';
import { SlideTransition } from '../transitions/SlideTransition';
import { easeOutCubic } from '../easings';
import { ControllerEvent } from '../input/ControllerEvent';
import { AppInfoJSON } from "appinfo.json";

export class CreditsScene extends Scene<FriendlyFire> {


    @asset("fonts/headline.font.json")
    private static headlineFont: BitmapFont;

    @asset("fonts/standard.font.json")
    private static standardFont: BitmapFont;

    @asset("images/credits.png")
    private static panelImage: HTMLImageElement;

    @asset("appinfo.json")
    private static appInfo: AppInfoJSON;

    public async setup(): Promise<void> {
        console.log(CreditsScene.appInfo);
        this.zIndex = 2;
        console.log('control scene is setup');
        this.inTransition = new SlideTransition({ duration: 0.5, direction: "bottom", easing: easeOutCubic });
        this.outTransition = new SlideTransition({ duration: 0.25, direction: "bottom" });
    }

    public activate(): void {
        console.log('control scene is activated');
        this.controllerManager.onButtonDown.connect(this.handleButtonDown, this);
    }

    public deactivate(): void {
        console.log('control scene is deactivate');
        this.controllerManager.onButtonDown.disconnect(this.handleButtonDown, this);
    }

    private handleButtonDown(event: ControllerEvent): void {
        this.scenes.popScene();
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();

        const x = (width / 2) - CreditsScene.panelImage.width / 2;
        const y = (height / 2) - CreditsScene.panelImage.height / 2;
        const textOffsetX = 10;
        ctx.translate(x, y);

        ctx.drawImage(CreditsScene.panelImage, 0, 0);
        ctx.font = "20px sans-serif";
        ctx.fillStyle = "white";

        CreditsScene.headlineFont.drawText(ctx, 'Friendly Fire', textOffsetX + 32, 25, "black");
        CreditsScene.standardFont.drawText(ctx, `Version ${CreditsScene.appInfo.version}`, textOffsetX + 168, 32, "black");
        ctx.restore();
    }

}
