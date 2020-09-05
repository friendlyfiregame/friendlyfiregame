import { AppInfoJSON } from "appinfo.json";
import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { BitmapFont } from "../BitmapFont";
import { ControllerEvent } from "../input/ControllerEvent";
import { DIALOG_FONT } from "../constants";
import { easeOutCubic } from "../easings";
import { FadeTransition } from "../transitions/FadeTransition";
import { FriendlyFire } from "../FriendlyFire";
import { isDev } from "../util";
import { Scene } from "../Scene";
import { Sound } from "../Sound";
import { TitleScene } from "./TitleScene";
import { Direction } from "../geom/Direction";
import { TextNode } from "../scene/TextNode";
import { SceneNode } from "../scene/SceneNode";
import { ImageNode } from "../scene/ImageNode";
import { AsepriteNode } from "../scene/AsepriteNode";

export class CreditsScene extends Scene<FriendlyFire> {
    @asset("music/a-vision-of-fire-acoustic.ogg")
    public static music: Sound;

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

    private starPositions: number[][] = [
        [318, 10],
        [288, 19],
        [260, 100],
        [370, 91],
        [409, 49],
        [446, 19],
        [436, 97],
        [185, 93],
        [159, 49],
        [322, 72],
        [153, 10],
        [211, 20],
        [59, 22],
        [17, 11],
        [102, 108]
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

    private lineSpacing = 4;

    public async setup(): Promise<void> {
        this.zIndex = 2;
        this.inTransition = new FadeTransition({ duration: 0.5, easing: easeOutCubic });
        this.outTransition = new FadeTransition({ duration: 0.25 });

        // The background
        new ImageNode({
            image: CreditsScene.backgroundImage,
            anchor: Direction.TOP_LEFT
        }).appendTo(this.rootNode);

        // The blinking stars
        this.starPositions.forEach((pos, index) => {
            new AsepriteNode({
                aseprite: CreditsScene.stars[index % CreditsScene.stars.length],
                tag: "idle",
                anchor: Direction.TOP_LEFT,
                x: pos[0],
                y: pos[1]
            }).appendTo(this.rootNode);
        });

        // The tree leaf
        new AsepriteNode({
            aseprite: CreditsScene.leaf,
            tag: "idle",
            anchor: Direction.TOP_LEFT,
            x: 414,
            y: 163
        }).appendTo(this.rootNode);

        // The gradient background behind the scrolling credits text
        new ImageNode({
            image: CreditsScene.overlayImage,
            anchor: Direction.TOP_LEFT,
            opacity: 0.75
        }).appendTo(this.rootNode);

        // The scrolling credits text
        this.createCreditsNode().appendTo(this.rootNode);

        // Shortened Git commit hash to provide support
        new TextNode({
            font: CreditsScene.standardFont,
            text: CreditsScene.appInfo.gitCommitHash.substr(0, 16),
            anchor: Direction.BOTTOM_RIGHT,
            x: this.game.width - 7,
            y: this.game.height - 4,
            color: "white"
        }).appendTo(this.rootNode);
    }

    public cleanup() {
        this.rootNode.clear();
    }

    private createCreditsNode(): SceneNode {
        const startY = this.game.height + 50;
        let totalCrawlHeight = 0;

        const credits = new SceneNode().appendTo(this.rootNode).animate({
            animator: (node, value, elapsed) => {
                node.setY(startY - (elapsed * 1000 / 36) % (totalCrawlHeight + startY));
            },
            duration: Infinity
        });

        const x = 20;
        let y = this.addTitle(credits, 0, x);

        y = this.addParagraph(credits, y, x, [
            "Originally made as a team",
            "effort for Ludum Dare 46",
            "in three days by"
        ]);

        y = this.addParagraph(credits, y, x, [
            "Eduard But, Nico Hülscher,",
            "Benjamin Jung, Nils Kreutzer,",
            "Bastian Lang, Ranjit Mevius,",
            "Markus Over, Klaus Reimer,",
            "and Jennifer van Veen"
        ], 50);

        y = this.addCredit(credits, y, x, "GAME DESIGN", ["Everyone"]);

        y = this.addCredit(credits, y, x, "STORY", [
            "Markus Over",
            "Jennifer van Veen",
            "Ranjit Mevius",
            "Nils Kreutzer"
        ]);

        y = this.addCredit(credits, y, x, "PROGRAMMING", [
            "Nico Hülscher",
            "Benjamin Jung",
            "Nils Kreutzer",
            "Ranjit Mevius",
            "Markus Over",
            "Klaus Reimer",
            "Eduard But",
            "Matthias Wetter"
        ]);

        y = this.addCredit(credits, y, x, "SCRIPTING", [
            "Markus Over",
            "Eduard But"
        ]);

        y = this.addCredit(credits, y, x, "ART DIRECTION", ["Eduard But"]);

        y = this.addCredit(credits, y, x, "2D ART", [
            "Eduard But",
            "Nils Kreutzer",
            "Christina Schneider",
            "Jennifer van Veen",
            "Matthias Wetter"
        ]);

        y = this.addCredit(credits, y, x, "WRITING", [
            "Markus Over",
            "Jennifer van Veen",
            "Eduard But"
        ]);

        y = this.addCredit(credits, y, x, "LEVEL DESIGN", [
            "Eduard But",
            "Nils Kreutzer",
            "Jennifer van Veen"
        ]);

        y = this.addCredit(credits, y, x, "DISTRIBUTION", [
            "Benjamin Jung",
        ]);

        y = this.addCredit(credits, y, x, "MUSIC", [
            "Bastian Lang",
            "Benjamin Jung",
            "Eduard But",
            "Matthias Wetter"
        ]);

        y = this.addCredit(credits, y, x, "QA", [
            "Jennifer van Veen",
            "Matthias Wetter"
        ]);

        y = this.addCredit(credits, y, x, "SFX", ["freesound.org"]);

        totalCrawlHeight = y;

        return credits;
    }

    public activate(): void {
        CreditsScene.music.setLoop(true);
        CreditsScene.music.setVolume(1);
        CreditsScene.music.play();
        this.input.onButtonDown.connect(this.handleButtonDown, this);
    }

    public deactivate(): void {
        CreditsScene.music.stop();
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

    private addTitle(credits: SceneNode, y: number, x: number): number {
        const gap = 5;
        const titleText = "Friendly Fire";
        const versionText = isDev() ? "DEVELOPMENT VERSION" : `Version ${CreditsScene.appInfo.version}`;

        y += new TextNode({
            font: CreditsScene.headlineFont,
            text: titleText,
            anchor: Direction.TOP_LEFT,
            x, y,
            color: "white"
        }).appendTo(credits).getHeight();

        y += gap;

        y += new TextNode({
            font: CreditsScene.standardFont,
            text: versionText,
            anchor: Direction.TOP_LEFT,
            x, y,
            color: "white"
        }).appendTo(credits).getHeight();

        return y + gap + 20;
    }

    private addParagraph(credits: SceneNode, y: number, x: number, lines: string[], marginBottom = 10): number {
        lines.forEach(line => {
            y += new TextNode({
                font: CreditsScene.standardFont,
                text: line,
                anchor: Direction.TOP_LEFT,
                x, y,
                color: "white"
            }).appendTo(credits).getHeight();
        });
        return y + marginBottom;
    }

    private addCredit(credits: SceneNode, y: number, x: number, title: string, names: string[]): number {
        const gap = 5;

        y += new TextNode({
            font: CreditsScene.creditsFont,
            text: title,
            anchor: Direction.TOP_LEFT,
            x, y,
            color: "white"
        }).appendTo(credits).getHeight();

        y += this.lineSpacing + gap;

        names.forEach(name => {
            y += new TextNode({
                font: CreditsScene.standardFont,
                text: name,
                anchor: Direction.TOP_LEFT,
                x, y,
                color: "white"
            }).appendTo(credits).getHeight();
        });

        return y + 40;
    }
}
