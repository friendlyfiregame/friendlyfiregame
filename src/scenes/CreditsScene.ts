import { Scene } from '../Scene';
import { FriendlyFire } from '../FriendlyFire';
import { asset } from '../Assets';
import { BitmapFont } from '../BitmapFont';
import { easeOutCubic } from '../easings';
import { ControllerEvent } from '../input/ControllerEvent';
import { AppInfoJSON } from "appinfo.json";
import { FadeTransition } from '../transitions/FadeTransition';
import { TitleScene } from './TitleScene';

export class CreditsScene extends Scene<FriendlyFire> {

    @asset("images/credits_bg.png")
    private static backgroundImage: HTMLImageElement;

    @asset("fonts/headline.font.json")
    private static headlineFont: BitmapFont;

    @asset("fonts/standard.font.json")
    private static standardFont: BitmapFont;

    @asset("fonts/credits.font.json")
    private static creditsFont: BitmapFont;

    @asset("appinfo.json")
    private static appInfo: AppInfoJSON;

    private time: number = 0;
    private lineSpacing = 4;
    private headlineCharHeight = 0;
    private standardCharHeight = 0;
    private creditsFontHeight = 0;
    private totalCrawlHeight = 0;

    public async setup(): Promise<void> {
        console.log(CreditsScene.appInfo);
        this.time = 0;
        this.zIndex = 2;
        this.inTransition = new FadeTransition({ duration: 0.5, easing: easeOutCubic });
        this.outTransition = new FadeTransition({ duration: 0.25 });
        this.headlineCharHeight = CreditsScene.headlineFont.measureText(" ").height;
        this.standardCharHeight = CreditsScene.standardFont.measureText(" ").height;
        this.creditsFontHeight = CreditsScene.creditsFont.measureText(" ").height;
    }

    public activate(): void {
        this.controllerManager.onButtonDown.connect(this.handleButtonDown, this);
    }

    public deactivate(): void {
        this.controllerManager.onButtonDown.disconnect(this.handleButtonDown, this);
    }

    private async handleButtonDown(event: ControllerEvent): Promise<void> {
        if (this.game.scenes.getPreviousScene() instanceof TitleScene) {
            this.game.scenes.popScene();
        } else {
            await this.game.scenes.popScene({ noTransition: true });
            this.game.scenes.setScene(TitleScene);
        }
    }

    public update(dt: number) {
        this.time += dt;
    }

    private drawTitle(ctx: CanvasRenderingContext2D, posY: number, posX: number): number {
        const gap = 5;
        const titleText = "Friendly Fire";
        const versionText = this.dev ? "DEVELOPMENT VERSION" : `Version ${CreditsScene.appInfo.version}`;
        CreditsScene.headlineFont.drawText(ctx, titleText, posX, posY, "white");
        CreditsScene.standardFont.drawText(ctx, versionText, posX, posY + this.headlineCharHeight + gap, "white");
        return posY + this.headlineCharHeight + this.standardCharHeight + gap + 20
    }

    private drawParagraph(ctx: CanvasRenderingContext2D, posY: number, posX: number, lines: string[], marginBotton = 10): number {
        let y = posY;
        lines.forEach(line => {
            CreditsScene.standardFont.drawText(ctx, line, posX, y, "white");
            y += this.standardCharHeight + this.lineSpacing;
        })
        return y + marginBotton;
    }

    private drawCredit(ctx: CanvasRenderingContext2D, posY: number, posX: number, title: string, names: string[]): number {
        let y = posY;
        const gap = 5;
        CreditsScene.creditsFont.drawText(ctx, title, posX, y, "white");
        y += this.creditsFontHeight + this.lineSpacing + gap;

        names.forEach(name => {
            CreditsScene.standardFont.drawText(ctx, name, posX, y, "white");
            y += this.standardCharHeight + this.lineSpacing;
        })
        return y + 40;
    }


    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();
        ctx.drawImage(CreditsScene.backgroundImage, 0, 0);

        const posX = 20;
        let posY = CreditsScene.backgroundImage.height - (this.time * 1000 / 36);

        // Reset Credits Crawl when it's over
        if (this.totalCrawlHeight > 0 && posY <= -this.totalCrawlHeight + CreditsScene.backgroundImage.height) {
            this.time = 0;
            posY = CreditsScene.backgroundImage.height;
        }

        ctx.font = "20px sans-serif";
        ctx.fillStyle = "white";

        const color = "white";

        posY = this.drawTitle(ctx, posY, posX);
        posY = this.drawParagraph(ctx, posY, posX, [
            'Originally made as a team',
            'effort for ludum dare 46',
            'in three days by'
        ]);
        posY = this.drawParagraph(ctx, posY, posX, [
            'Eduard But, Nico Huelscher,',
            'Benjamin Jung, Nils Kreutzer,',
            'Bastian Lang, Ranjit Mevius,',
            'Markus Over, Klaus Reimer and',
            'Jennifer van Veen'
        ], 50);
        posY = this.drawCredit(ctx, posY, posX, 'GAME DESIGN', ['Everyone']);
        posY = this.drawCredit(ctx, posY, posX, 'STORY', [
            'Markus Over',
            'Jennifer van Veen',
            'Ranjit Mevius',
            'Nils Kreutzer'
        ]);
        posY = this.drawCredit(ctx, posY, posX, 'PROGRAMMING', [
            'Nico Huelscher',
            'Benjaming Jung',
            'Nils Kreutzer',
            'Ranjit Mevius',
            'Markus Over',
            'Klaus Reimer'
        ]);
        posY = this.drawCredit(ctx, posY, posX, 'ART DIRECTION', ['Eduard But']);
        posY = this.drawCredit(ctx, posY, posX, '2D ART', [
            'Eduard But',
            'Nils Kreutzer',
            'Christina Schneider',
            'Jennifer van Veen'
        ]);

        posY = this.drawCredit(ctx, posY, posX, 'WRITING', [
            'Eduard But',
            'Markus Over',
            'Jennifer van Veen'
        ]);

        posY = this.drawCredit(ctx, posY, posX, 'Level Design', [
            'Eduard But',
            'Nils Kreutzer',
            'Jennifer van Veen'
        ]);

        posY = this.drawCredit(ctx, posY, posX, 'Distribution', [
            'Benjamin Jung',
        ]);

        posY = this.drawCredit(ctx, posY, posX, 'MUSIC', ['Bastian Lang']);
        posY = this.drawCredit(ctx, posY, posX, 'QA', ['Jennifer van Veen']);
        posY = this.drawCredit(ctx, posY, posX, 'SFX', ['freesound.org']);

        if (this.totalCrawlHeight === 0) this.totalCrawlHeight = posY;

        // Shortened Git commit hash to provide support.
        const shortenedGitCommitHash = CreditsScene.appInfo.gitCommitHash.substr(0, 16);
        const shortenedGitCommitHashTextSize = CreditsScene.standardFont.measureText(shortenedGitCommitHash);
        CreditsScene.standardFont.drawText(ctx, shortenedGitCommitHash, CreditsScene.backgroundImage.width - shortenedGitCommitHashTextSize.width - 5, CreditsScene.backgroundImage.height - shortenedGitCommitHashTextSize.height - 5, color);

        ctx.restore();
    }

}
