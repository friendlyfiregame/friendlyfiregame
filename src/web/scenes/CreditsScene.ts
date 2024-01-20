import { APP_NAME, DIALOG_FONT, GAME_CANVAS_WIDTH } from "../../shared/constants";
import { type AppInfoJSON } from "../AppInfo";
import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { type Sound } from "../audio/Sound";
import { BitmapFont } from "../BitmapFont";
import { CharacterAsset } from "../Campaign";
import { easeOutCubic } from "../easings";
import { type FriendlyFire } from "../FriendlyFire";
import { Direction } from "../geom/Direction";
import { type ControllerEvent } from "../input/ControllerEvent";
import { QuestKey } from "../Quests";
import { Scene } from "../Scene";
import { AsepriteNode } from "../scene/AsepriteNode";
import { ImageNode } from "../scene/ImageNode";
import { SceneNode } from "../scene/SceneNode";
import { TextNode } from "../scene/TextNode";
import { FadeTransition } from "../transitions/FadeTransition";
import { isDev } from "../util";
import { TitleScene } from "./TitleScene";

export class CreditsScene extends Scene<FriendlyFire> {
    @asset([
        "music/a-vision-of-fire-acoustic.ogg",
        "music/a-vision-of-fire-orchestral.ogg",
        "music/a-vision-of-fire.ogg",
    ])
    public static music: Sound[];

    @asset([
        "sprites/stars/star1.aseprite.json",
        "sprites/stars/star2.aseprite.json",
        "sprites/stars/star3.aseprite.json",
        "sprites/stars/star4.aseprite.json",
        "sprites/stars/star5.aseprite.json"
    ])
    private static readonly stars: Aseprite[];

    @asset("sprites/credits/leaf.aseprite.json")
    private static readonly leaf: Aseprite;

    @asset("sprites/credits/spaceship.aseprite.json")
    private static readonly spaceship: Aseprite;

    @asset("sprites/credits/spaceshipsmall.aseprite.json")
    private static readonly spaceshipsmall: Aseprite;

    private readonly starPositions: number[][] = [
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
    private static readonly backgroundImage: HTMLImageElement;

    @asset("images/credits/bg-space.png")
    private static readonly backgroundImageSpace: HTMLImageElement;

    @asset("images/credits/overlay.png")
    private static readonly overlayImage: HTMLImageElement;

    @asset("fonts/headline.font.json")
    private static readonly headlineFont: BitmapFont;

    @asset(DIALOG_FONT)
    private static readonly standardFont: BitmapFont;

    @asset("fonts/credits.font.json")
    private static readonly creditsFont: BitmapFont;

    @asset("appinfo.json")
    private static readonly appInfo: AppInfoJSON;

    private readonly lineSpacing = 4;
    private targetMusic: Sound | null = null;

    private getCorrectBackgroundTrack(): Sound {
        const ending = this.game.campaign.quests.find(q => q.isFinished());
        if (ending && ending.key === QuestKey.E) return CreditsScene.music[2];

        if (this.game.campaign.selectedCharacter === CharacterAsset.FEMALE) return CreditsScene.music[1];
        if (this.game.campaign.selectedCharacter === CharacterAsset.MALE) return CreditsScene.music[0];
        return CreditsScene.music[2];
    }

    public override get urlFragment(): string {
        return "#credits";
    }

    public override setup(): void {
        const ending = this.game.campaign.quests.find(q => q.isFinished());
        this.zIndex = 2;
        this.inTransition = new FadeTransition({ duration: 0.5, easing: easeOutCubic });
        this.outTransition = new FadeTransition({ duration: 0.25 });
        this.targetMusic = this.getCorrectBackgroundTrack();

        if (ending && ending.key === QuestKey.E) {
            // The background
            new ImageNode({
                image: CreditsScene.backgroundImageSpace,
                anchor: Direction.TOP_LEFT
            }).appendTo(this.rootNode);

            // Spaceship
            new AsepriteNode({
                aseprite: CreditsScene.spaceship,
                tag: "idle",
                anchor: Direction.TOP_LEFT,
                x: GAME_CANVAS_WIDTH,
                y: 200
            }).animate({
                animator: (node, value) => node.setX((GAME_CANVAS_WIDTH + 50) - value * GAME_CANVAS_WIDTH),
                duration: 100,
            }).appendTo(this.rootNode);

            // Spaceship
            new AsepriteNode({
                aseprite: CreditsScene.spaceshipsmall,
                tag: "idle",
                anchor: Direction.TOP_LEFT,
                x: GAME_CANVAS_WIDTH,
                y: 185
            }).animate({
                animator: (node, value) => node.setX((GAME_CANVAS_WIDTH + 10) - value * GAME_CANVAS_WIDTH),
                duration: 200,
            }).appendTo(this.rootNode);
        } else {
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
        }
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
            text: CreditsScene.appInfo.gitCommitHash.substring(0, 7),
            anchor: Direction.BOTTOM_RIGHT,
            x: this.game.width - 7,
            y: this.game.height - 4,
            color: "white"
        }).appendTo(this.rootNode);
    }

    public override cleanup(): void {
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

    public override activate(): void {
        if (this.targetMusic) {
            this.targetMusic.setLoop(true);
            this.targetMusic.setVolume(1);
            this.targetMusic.play();
        }
        this.input.onButtonDown.connect(this.handleButtonDown, this);
    }

    public override deactivate(): void {
        if (this.targetMusic) {
            this.targetMusic.stop();
        }
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
    }

    private async handleButtonDown(event: ControllerEvent): Promise<void> {
        if (this.scenes.getPreviousScene() instanceof TitleScene) {
            await this.game.scenes.popScene();
        } else {
            await this.scenes.setScene(TitleScene);
        }
    }

    private addTitle(credits: SceneNode, y: number, x: number): number {
        const gap = 5;
        const titleText = APP_NAME;
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
