import { asset } from "../Assets";
import { BitmapFont } from "../BitmapFont";
import { ControllerFamily } from "../input/ControllerFamily";
import { CreditsScene } from "./CreditsScene";
import { DIALOG_FONT } from "../constants";
import { FriendlyFire } from "../FriendlyFire";
import { Scene } from "../Scene";
import { Sound } from "../audio/Sound";
import { ImageNode } from "../scene/ImageNode";
import { TextNode } from "../scene/TextNode";
import { easeOutQuad } from "../easings";
import { Direction } from "../geom/Direction";
import { GlobalState } from "../GlobalState";

export class EndScene extends Scene<FriendlyFire> {
    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    @asset("images/ending/ff.png")
    private static logo: HTMLImageElement;

    @asset("sounds/ending/boom.mp3")
    private static boom: Sound;

    private subtitleDelay = 2;
    private inputDelay = 4;

    public setup(): void {
        const ending = this.game.campaign.quests.find(q => q.isFinished());

        if (ending) {
            GlobalState.setAchievedEnding(ending.key);
            GlobalState.setHasBeatenGame();
        }

        // The logo image
        new ImageNode({
            image: EndScene.logo,
            x: this.game.width >> 1,
            y: (this.game.height >> 1) - 15
        }).appendTo(this.rootNode);

        // Fade in subtitle after a delay
        new TextNode({
            font: EndScene.font,
            text: ending?.title ?? "Unknown [E]nding",
            x: this.game.width >> 1,
            y: (this.game.height >> 1) + 11,
            color: "red",
            opacity: 0
        }).animate({
            animator: (node, value) => node.setOpacity(value),
            delay: this.subtitleDelay,
            duration: 0.5,
            easing: easeOutQuad
        }).appendTo(this.rootNode);

        // Inform the user, that it's possible to return to the title
        const text = `Press any ${this.input.currentControllerFamily === ControllerFamily.KEYBOARD
            ? "key" : "button"} to continue.`;
        new TextNode({
            font: EndScene.font,
            text,
            anchor: Direction.BOTTOM,
            x: this.game.width >> 1,
            y: this.game.height - 15,
            color: "darkgrey",
            opacity: 0
        }).animate({
            animator: (node, value) => node.setOpacity(value),
            delay: this.inputDelay,
            duration: 0.5,
            easing: easeOutQuad
        }).appendTo(this.rootNode);
    }

    public activate(): void {
        setTimeout(() => {
            EndScene.boom.setLoop(false);
            EndScene.boom.play();
        }, this.subtitleDelay * 1000);

        setTimeout(() => {
            this.input.onButtonDown.connect(this.gotoCreditsScene, this);
        }, this.inputDelay * 1000);
    }

    public deactivate(): void {
        this.input.onButtonDown.disconnect(this.gotoCreditsScene, this);
    }

    private gotoCreditsScene(): void {
        this.game.scenes.setScene(CreditsScene);
    }

    public cleanup() {
        this.rootNode.clear();
    }
}
