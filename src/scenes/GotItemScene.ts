import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { asset } from "../Assets";
import { easeOutExpo } from "../easings";
import { BitmapFont } from "../BitmapFont";
import { SlideTransition } from '../transitions/SlideTransition';

export enum Item { DOUBLEJUMP, MULTIJUMP }

export class GotItemScene extends Scene<FriendlyFire> {
    @asset("fonts/standard.font.json")
    private static font: BitmapFont;

    @asset("fonts/headline.font.json")
    private static headlineFont: BitmapFont;

    @asset([
        "sprites/powerup_doublejump.png",
        "sprites/powerup_multijump.png"
    ])
    private static itemImages: HTMLImageElement[];

    private time = 0;
    private stopped = false;
    private targetItem: Item = Item.DOUBLEJUMP;
    private floatAmount = 3;
    private floatSpeed = 4;

    private titles = [
        "Double Jump Boots",
        "Flying Wings"
    ]

    private subtitles = [
        [
            "Not suitable for step dancing",
            "An all time classic",
            "Still in mint condition",
            "Even works without wearing them",
            "Why would a tree have those?",
        ],
        [
            "Birds love it!",
            "Feels like cheating",
            "Free stuff is the best",
            "m-m-m-m-multijump"
        ],
    ]
    private selectedSubtitle = '';

    public setup(): void {
        if (this.properties?.item) {
            this.targetItem = this.properties.item as Item;
        }
        this.selectedSubtitle = "'" + this.subtitles[this.targetItem][Math.floor(Math.random() * this.subtitles[this.targetItem].length)] + "'";
        this.stopped = false;
        this.time = 0;
        this.inTransition = new SlideTransition({ duration: 1, direction: "bottom", easing: easeOutExpo });
        this.outTransition = new SlideTransition({ duration: 1, direction: "bottom", easing: easeOutExpo });
    }

    public update(dt: number) {
        if (!this.stopped) {
            this.time += dt;

            if (this.time > 5) {
                this.stopped = true;
                this.scenes.popScene();
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        let metrics;

        ctx.save();
        ctx.translate(0, height >> 1);

        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "black";
        ctx.fillRect(0, -1, width, 50);

        const itemNameText = this.titles[this.targetItem];
        metrics = GotItemScene.headlineFont.measureText(itemNameText);
        GotItemScene.headlineFont.drawText(ctx, itemNameText, (width - metrics.width) >> 1, 10, "white");

        metrics = GotItemScene.font.measureText(this.selectedSubtitle);
        GotItemScene.font.drawText(ctx, this.selectedSubtitle, (width - metrics.width) >> 1, 30, "white");

        ctx.scale(2, 2);
        const image = GotItemScene.itemImages[this.targetItem];
        const floatOffsetY = Math.sin(this.time * this.floatSpeed) * this.floatAmount;
        ctx.drawImage(image, (width / 4) - image.width / 2, -25 - floatOffsetY);
        
        ctx.restore();
    }
}
