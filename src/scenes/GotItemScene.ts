import { Aseprite } from '../Aseprite';
import { asset } from '../Assets';
import { BitmapFont } from '../BitmapFont';
import { DIALOG_FONT } from '../constants';
import { easeInExpo, easeOutExpo } from '../easings';
import { FriendlyFire } from '../FriendlyFire';
import { Scene } from '../Scene';
import { SlideTransition } from '../transitions/SlideTransition';
import { Sound } from '../Sound';

export enum Item { RUNNING, DOUBLEJUMP, MULTIJUMP, RAINDANCE, FRIENDSHIP }

export class GotItemScene extends Scene<FriendlyFire> {
    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    @asset("fonts/headline.font.json")
    private static headlineFont: BitmapFont;

    @asset("sounds/item/fanfare.mp3")
    public static sound: Sound;

    @asset([
        "sprites/powerup_running.png",
        "sprites/powerup_doublejump.png",
        "sprites/powerup_multijump.png",
        "sprites/powerup_raindance.png",
        "sprites/powerup_friendship.aseprite.json"
    ])
    private static itemImages: (HTMLImageElement | Aseprite)[];

    private itemPosition = {
        x: 0,
        y: 0
    }

    private time = 0;
    private stopped = false;
    private targetItem: Item = Item.DOUBLEJUMP;
    private floatAmount = 3;
    private floatSpeed = 4;

    private titles = [
        "Fear of the Dark",
        "Double-Jump Boots",
        "Flying Wings Knock-off",
        "Dancing Dave",
        "Eternal Friendship"
    ]

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
        ]
    ]
    private selectedSubtitle = '';

    public setup(): void {
        GotItemScene.sound.setVolume(0.7);
        GotItemScene.sound.play();
        if (this.properties?.item !== undefined) {
            this.targetItem = this.properties.item as Item;
        }
        this.selectedSubtitle = "“" + this.subtitles[this.targetItem][Math.floor(Math.random() * this.subtitles[this.targetItem].length)] + "”";
        this.stopped = false;
        this.time = 0;
        this.inTransition = new SlideTransition({ duration: .5, direction: "bottom", easing: easeOutExpo });
        this.outTransition = new SlideTransition({ duration: .5, direction: "bottom", easing: easeInExpo });
    }

    public update(dt: number): void {
        if (!this.stopped) {
            this.time += dt;

            if (this.time > 4) {
                this.stopped = true;
                this.scenes.popScene();
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        let metrics;
        const centerY = height >> 1;
        const centerX = (width / 2) - GotItemScene.itemImages[this.targetItem].width;
        const floatOffsetY = Math.sin(this.time * this.floatSpeed) * this.floatAmount;

        this.itemPosition.x = centerX;
        this.itemPosition.y = centerY - 40 - floatOffsetY;

        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "black";
        ctx.fillRect(0, centerY - 1, width, 50);

        const itemNameText = this.titles[this.targetItem];
        metrics = GotItemScene.headlineFont.measureText(itemNameText);
        GotItemScene.headlineFont.drawText(ctx, itemNameText, (width - metrics.width) >> 1, centerY + 10, "white");

        metrics = GotItemScene.font.measureText(this.selectedSubtitle);
        GotItemScene.font.drawText(ctx, this.selectedSubtitle, (width - metrics.width) >> 1, centerY + 30, "white");

        ctx.scale(2, 2);
        const image = GotItemScene.itemImages[this.targetItem];

        if (image instanceof HTMLImageElement) {
            ctx.drawImage(image, this.itemPosition.x / 2, this.itemPosition.y / 2);
        } else {
            image.drawTag(ctx, "idle", this.itemPosition.x / 2, this.itemPosition.y / 2);
        }

        ctx.restore();
    }
}
