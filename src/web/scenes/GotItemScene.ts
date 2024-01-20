import { DIALOG_FONT } from "../../shared/constants";
import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Sound } from "../audio/Sound";
import { BitmapFont } from "../BitmapFont";
import { easeInExpo, easeOutExpo } from "../easings";
import { type FriendlyFire } from "../FriendlyFire";
import { Direction } from "../geom/Direction";
import { Scene } from "../Scene";
import { AsepriteNode } from "../scene/AsepriteNode";
import { SceneNode } from "../scene/SceneNode";
import { TextNode } from "../scene/TextNode";
import { SlideTransition } from "../transitions/SlideTransition";

export enum Item { RUNNING, DOUBLEJUMP, MULTIJUMP, RAINDANCE, FRIENDSHIP }

export class GotItemScene extends Scene<FriendlyFire, Item> {
    @asset(DIALOG_FONT)
    private static readonly font: BitmapFont;

    @asset("fonts/headline.font.json")
    private static readonly headlineFont: BitmapFont;

    @asset("sounds/item/fanfare.mp3")
    private static readonly sound: Sound;

    @asset([
        "sprites/powerup_running.aseprite.json",
        "sprites/powerup_doublejump.aseprite.json",
        "sprites/powerup_multijump.aseprite.json",
        "sprites/powerup_raindance.aseprite.json",
        "sprites/powerup_friendship.aseprite.json"
    ])
    private static readonly itemImages: Aseprite[];

    private readonly floatAmount = 3;
    private readonly floatSpeed = 4;

    private readonly titles = [
        "Fear of the Dark",
        "Double-Jump Boots",
        "Flying Wings Knock-off",
        "Dancing Dave",
        "Eternal Friendship"
    ];

    private readonly subtitles = [
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
        ]
    ];

    public override setup(item: Item): void {
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
        }).appendChild(new AsepriteNode({ aseprite: image, tag: "idle", anchor: Direction.BOTTOM })
        ).appendTo(this.rootNode);
    }

    public override activate(): void {
        // Close this scene after 4 seconds
        setTimeout(() => this.scenes.popScene(), 4000);
    }

    public override cleanup(): void {
        this.rootNode.clear();
    }

    public override draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, (height >> 1) - 1, width, 50);
        ctx.restore();
        super.draw(ctx, width, height);
    }
}
