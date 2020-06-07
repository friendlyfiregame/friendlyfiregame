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

        const lineSpacing = 4;
        let headlineCharSize = CreditsScene.headlineFont.measureText(" ");
        let standardCharSize = CreditsScene.standardFont.measureText(" ");

        const titleText = "Friendly Fire";
        const titleTextSize = CreditsScene.headlineFont.measureText(titleText);

        const versionText = this.dev ? "DEVELOPMENT VERSION" : `Version ${CreditsScene.appInfo.version}`;
        const versionTextSize = CreditsScene.standardFont.measureText(versionText);

        let txtPosY = 25;
        CreditsScene.headlineFont.drawText(ctx, titleText, CreditsScene.panelImage.width / 2 - titleTextSize.width / 2, txtPosY, "black");
        txtPosY += headlineCharSize.height + lineSpacing;
        CreditsScene.standardFont.drawText(ctx, versionText, CreditsScene.panelImage.width / 2 - versionTextSize.width / 2, txtPosY, "black");
        txtPosY += standardCharSize.height * 2 + lineSpacing * 2;

        // TODO Read / generate authors list from package.json or something else.
        // TODO Improve the appearance of the creators list
        CreditsScene.standardFont.drawTextWithOutline(ctx, "Created by:", textOffsetX, txtPosY, "white", "black");
        txtPosY += standardCharSize.height + lineSpacing + lineSpacing / 2;
        CreditsScene.standardFont.drawText(ctx, "Eduard But     Nico Huelscher    Benjamin Jung", textOffsetX, txtPosY, "black");
        txtPosY += standardCharSize.height + lineSpacing;
        CreditsScene.standardFont.drawText(ctx, "Nils Kreutzer   Bastian Lang     Ranjit Mevius", textOffsetX, txtPosY, "black");
        txtPosY += standardCharSize.height + lineSpacing;
        CreditsScene.standardFont.drawText(ctx, "Markus Over   Klaus Reimer   Jennifer van Veen", textOffsetX, txtPosY, "black");

        // Shortened Git commit hash to provide support.
        const shortenedGitCommitHash = CreditsScene.appInfo.gitCommitHash.substr(0, 16);
        const shortenedGitCommitHashTextSize = CreditsScene.standardFont.measureText(shortenedGitCommitHash);
        CreditsScene.standardFont.drawText(ctx, shortenedGitCommitHash, CreditsScene.panelImage.width - shortenedGitCommitHashTextSize.width- textOffsetX, CreditsScene.panelImage.height - shortenedGitCommitHashTextSize.height- textOffsetX, "black");

        ctx.restore();
    }

}
