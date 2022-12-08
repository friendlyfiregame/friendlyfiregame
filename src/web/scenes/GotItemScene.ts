import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { BitmapFont } from "../BitmapFont";
import { DIALOG_FONT } from "../../shared/constants";
import { easeInExpo, easeOutExpo } from "../easings";
import { FriendlyFire } from "../FriendlyFire";
import { Scene } from "../Scene";
import { SlideTransition } from "../transitions/SlideTransition";
import { Sound } from "../audio/Sound";
import { ImageNode } from "../scene/ImageNode";
import { Direction } from "../geom/Direction";
import { AsepriteNode } from "../scene/AsepriteNode";
import { SceneNode } from "../scene/SceneNode";
import { TextNode } from "../scene/TextNode";

export enum Item { RUNNING, DOUBLEJUMP, MULTIJUMP, RAINDANCE, FRIENDSHIP, CHAOS, WEIRD_THROW, FLYING, ABYSS_WALKING }

export class GotItemScene extends Scene<FriendlyFire, Item> {
    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    @asset("fonts/headline.font.json")
    private static headlineFont: BitmapFont;

    @asset("sounds/item/fanfare.mp3")
    private static sound: Sound;

    @asset([
        "sprites/powerup_running.png",
        "sprites/powerup_doublejump.png",
        "sprites/powerup_multijump.png",
        "sprites/powerup_raindance.png",
        "sprites/powerup_friendship.aseprite.json",
        "sprites/powerup_chaos.aseprite.json",
        "sprites/powerup_superthrow.aseprite.json",
        "sprites/powerup_flying.aseprite.json",
        "sprites/powerup_abysswalking.aseprite.json",
    ])
    private static itemImages: (HTMLImageElement | Aseprite)[];

    private floatAmount = 3;
    private floatSpeed = 4;

    private titles = [
        "Fear of the Dark",
        "Double-Jump Boots",
        "Flying Wings Knock-off",
        "Dancing Dave",
        "Eternal Friendship",
        "The Way of Goose",
        "Super Throw",
        "Almighty Flying",
        "Abyss walking"
    ];

    private subtitles = [
        [
            "Run and never look back",
            "An exceptional ally",
            "There is something in that dark corner"
        ],
        [
            "Not suitable for step dancing",
            "An all-time classic",
            "Still in mint condition",
            "Even work without wearing them",
            "Why would a tree have those?"
        ],
        [
            "Birds love it!",
            "Feels like cheating",
            "Free stuff is the best",
            "M-m-m-multi-jump"
        ],
        [
            "Like tears in the rain"
        ],
        [
            "Dogs are the best!",
            "What might this be good for?",
            "Powered by unconditional love",
            "Nothing can stop us!"
        ],
        [
            "Let's pick them up!",
            "Time for a power up",
        ],
        [
            "You can throw... still",
            "Yeeeeet",
            "Throwing stuff is fun",
        ],
        [
            "The real deal",
            "Actual flight!",
            "Multijumping is for losers",
        ],
        [
            "It may stare back...",
            "Not guarded by a wolf",
            "Feels kinda familiar",
            "Accompanied by a ghostly presence",
        ],
    ];

    public setup(item: Item): void {
        GotItemScene.sound.setVolume(0.7);
        GotItemScene.sound.play();

        this.inTransition = new SlideTransition({ duration: .5, direction: "bottom", easing: easeOutExpo });
        this.outTransition = new SlideTransition({ duration: .5, direction: "bottom", easing: easeInExpo });

        const subtitle = "“" + this.subtitles[item][Math.floor(Math.random() * this.subtitles[item].length)] + "”";
        const image = GotItemScene.itemImages[item];

        // The powerup name
        new TextNode({
            font: GotItemScene.headlineFont,
            text: this.titles[item],
            x: this.game.width >> 1,
            y: (this.game.height >> 1) + 17,
            color: "white"
        }).appendTo(this.rootNode);

        // The powerup subtitle
        new TextNode({
            font: GotItemScene.font,
            text: subtitle,
            color: "white",
            x: this.game.width >> 1,
            y: (this.game.height >> 1) + 36
        }).appendTo(this.rootNode);

        // The power up image bobbling up and down
        new SceneNode({
            x: this.game.width >> 1,
            y: this.game.height >> 1
        }).animate({
            animator: node => node.transform(m => m.setScale(2).translateY(Math.sin(Date.now() / 1000
                * this.floatSpeed) * this.floatAmount)),
            duration: Infinity
        }).appendChild(image instanceof HTMLImageElement
            ? new ImageNode({ image, anchor: Direction.BOTTOM })
            : new AsepriteNode({ aseprite: image, tag: "idle", anchor: Direction.BOTTOM })
        ).appendTo(this.rootNode);
    }

    public activate(): void {
        // Close this scene after 4 seconds
        setTimeout(() => this.scenes.popScene(), 4000);
    }

    public cleanup(): void {
        this.rootNode.clear();
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, (height >> 1) - 1, width, 50);
        ctx.restore();
        super.draw(ctx, width, height);
    }
}
