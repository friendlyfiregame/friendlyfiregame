import { AppInfoJSON } from 'appinfo.json';
import { Aseprite } from '../Aseprite';
import { asset } from '../Assets';
import { BitmapFont } from '../BitmapFont';
import { ControllerEvent } from '../input/ControllerEvent';
import { DIALOG_FONT } from '../constants';
import { easeOutCubic } from '../easings';
import { FadeTransition } from '../transitions/FadeTransition';
import { FriendlyFire } from '../FriendlyFire';
import { isDev } from '../util';
import { Point } from '../Geometry'
import { Scene } from '../Scene';
import { Sound } from '../Sound';
import { TitleScene } from './TitleScene';

export class CreditsScene extends Scene<FriendlyFire> {
    @asset([
        "music/a-vision-of-fire.mp3",
        "music/a-vision-of-fire-acoustic.ogg"
    ])
    public static music: Sound[];

    private songIndex = 1;

    @asset([
        "sprites/stars/star1.aseprite.json",
        "sprites/stars/star2.aseprite.json",
        "sprites/stars/star3.aseprite.json",
        "sprites/stars/star4.aseprite.json",
        "sprites/stars/star5.aseprite.json"
    ])
    private static stars: Aseprite[];

    @asset("sprites/credits/leaf.aseprite.json")
    private static leaf: Aseprite;

    private starPositions: Point[] = [
        new Point(17, 11),
        new Point(59, 22),
        new Point(102, 108),
        new Point(153, 10),
        new Point(159, 49),
        new Point(185, 93),
        new Point(211, 20),
        new Point(260, 100),
        new Point(288, 19),
        new Point(318, 10),
        new Point(322, 72),
        new Point(370, 91),
        new Point(409, 49),
        new Point(436, 97),
        new Point(446, 19)
    ];

    @asset("images/credits/bg.png")
    private static backgroundImage: HTMLImageElement;

    @asset("images/credits/overlay.png")
    private static overlayImage: HTMLImageElement;

    @asset("fonts/headline.font.json")
    private static headlineFont: BitmapFont;

    @asset(DIALOG_FONT)
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
        this.time = 0;
        this.zIndex = 2;
        this.inTransition = new FadeTransition({ duration: 0.5, easing: easeOutCubic });
        this.outTransition = new FadeTransition({ duration: 0.25 });
        this.headlineCharHeight = CreditsScene.headlineFont.charHeight;
        this.standardCharHeight = CreditsScene.standardFont.charHeight;
        this.creditsFontHeight = CreditsScene.creditsFont.charHeight;
    }

    public activate(): void {
        CreditsScene.music[this.songIndex].setLoop(true);
        CreditsScene.music[this.songIndex].setVolume(1);
        CreditsScene.music[this.songIndex].play();
        this.input.onButtonDown.connect(this.handleButtonDown, this);
    }

    public deactivate(): void {
        CreditsScene.music[this.songIndex].stop();
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
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

    private drawTitle(ctx: CanvasRenderingContext2D, position: Point): Point {
        const gap = 5;
        const titleText = "Friendly Fire";
        const versionText = isDev() ? "DEVELOPMENT VERSION" : `Version ${CreditsScene.appInfo.version}`;

        CreditsScene.headlineFont.drawText(ctx, titleText, position, 'white');

        CreditsScene.standardFont.drawText(
            ctx,
            versionText,
            position.moveYBy(this.headlineCharHeight + gap),
            'white'
        );

        return position.moveYBy(this.headlineCharHeight + this.standardCharHeight + gap + 20);
    }

    private drawParagraph(
        ctx: CanvasRenderingContext2D, position: Point, lines: string[], marginBotton = 10
    ): Point {
        lines.forEach(line => {
            CreditsScene.standardFont.drawText(ctx, line, position, 'white');
            position.moveYBy(this.standardCharHeight);
        })

        return position.moveYBy(marginBotton);
    }

    private drawCredit(
        ctx: CanvasRenderingContext2D, position: Point, title: string, names: string[]
    ): Point {
        const gap = 5;

        CreditsScene.creditsFont.drawText(ctx, title, position, 'white');
        position.moveYBy(this.creditsFontHeight + this.lineSpacing + gap);

        names.forEach(name => {
            CreditsScene.standardFont.drawText(ctx, name, position, 'white');
            position.moveYBy(this.standardCharHeight);
        })

        return position.moveYBy(40);
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.drawImage(CreditsScene.backgroundImage, 0, 0);

        // Stars
        this.starPositions.forEach((position, index) => {
            const starIndex = index % CreditsScene.stars.length;
            CreditsScene.stars[starIndex].drawTag(ctx, 'idle', position, this.time * 1000);
        });

        // Leaf
        CreditsScene.leaf.drawTag(ctx, "idle", new Point(414, 163), this.time * 1000);

        ctx.globalAlpha = .75;
        ctx.drawImage(CreditsScene.overlayImage, 0, 0);

        ctx.globalAlpha = 1;

        let currentPosition = new Point(
            20,
            CreditsScene.backgroundImage.height + 50 - (this.time * 1000 / 36)
        );

        // Reset Credits Crawl when it's over
        if (
            this.totalCrawlHeight > 0
            && currentPosition.y <= -this.totalCrawlHeight + CreditsScene.backgroundImage.height
        ) {
            this.time = 0;
            currentPosition.moveXTo(CreditsScene.backgroundImage.height);
        }

        ctx.font = "20px sans-serif";
        ctx.fillStyle = "white";

        const color = "white";

        currentPosition = this.drawTitle(ctx, currentPosition);

        currentPosition = this.drawParagraph(ctx, currentPosition, [
            'Originally made as a team',
            'effort for Ludum Dare 46',
            'in three days by'
        ]);

        currentPosition = this.drawParagraph(ctx, currentPosition, [
            'Eduard But, Nico Hülscher,',
            'Benjamin Jung, Nils Kreutzer,',
            'Bastian Lang, Ranjit Mevius,',
            'Markus Over, Klaus Reimer,',
            'and Jennifer van Veen'
        ], 50);

        currentPosition = this.drawCredit(ctx, currentPosition, 'GAME DESIGN', ['Everyone']);

        currentPosition = this.drawCredit(ctx, currentPosition, 'STORY', [
            'Markus Over',
            'Jennifer van Veen',
            'Ranjit Mevius',
            'Nils Kreutzer'
        ]);

        currentPosition = this.drawCredit(ctx, currentPosition, 'PROGRAMMING', [
            'Nico Hülscher',
            'Benjaming Jung',
            'Nils Kreutzer',
            'Ranjit Mevius',
            'Markus Over',
            'Klaus Reimer',
            'Eduard But',
            'Matthias Wetter'
        ]);

        currentPosition = this.drawCredit(ctx, currentPosition, 'SCRIPTING', [
            'Markus Over',
            'Eduard But'
        ]);

        currentPosition = this.drawCredit(ctx, currentPosition, 'ART DIRECTION', ['Eduard But']);

        currentPosition = this.drawCredit(ctx, currentPosition, '2D ART', [
            'Eduard But',
            'Nils Kreutzer',
            'Christina Schneider',
            'Jennifer van Veen',
            'Matthias Wetter'
        ]);

        currentPosition = this.drawCredit(ctx, currentPosition, 'WRITING', [
            'Markus Over',
            'Jennifer van Veen',
            'Eduard But'
        ]);

        currentPosition = this.drawCredit(ctx, currentPosition, 'LEVEL DESIGN', [
            'Eduard But',
            'Nils Kreutzer',
            'Jennifer van Veen'
        ]);

        currentPosition = this.drawCredit(ctx, currentPosition, 'DISTRIBUTION', [
            'Benjamin Jung',
        ]);

        currentPosition = this.drawCredit(ctx, currentPosition, 'MUSIC', [
            'Bastian Lang',
            'Benjamin Jung',
            'Eduard But',
            'Matthias Wetter'
        ]);

        currentPosition = this.drawCredit(ctx, currentPosition, 'QA', [
            'Jennifer van Veen',
            'Matthias Wetter'
        ]);

        currentPosition = this.drawCredit(ctx, currentPosition, 'SFX', ['freesound.org']);

        if (this.totalCrawlHeight === 0) {
            this.totalCrawlHeight = currentPosition.y;
        }

        // Shortened Git commit hash to provide support.
        const shortenedGitCommitHash = CreditsScene.appInfo.gitCommitHash.substr(0, 16);
        const shortenedGitCommitHashTextSize = CreditsScene.standardFont.measureText(shortenedGitCommitHash);

        CreditsScene.standardFont.drawText(
            ctx,
            shortenedGitCommitHash,
            new Point(
                CreditsScene.backgroundImage.width - shortenedGitCommitHashTextSize.width - 7,
                CreditsScene.backgroundImage.height - shortenedGitCommitHashTextSize.height - 4
            ),
            color
        );

        ctx.restore();
    }
}
