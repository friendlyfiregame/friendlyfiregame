import { DIALOG_FONT } from "../../shared/constants";
import { asset } from "../Assets";
import { Sound } from "../audio/Sound";
import { BitmapFont } from "../BitmapFont";
import { easeOutQuad } from "../easings";
import type { FriendlyFire } from "../FriendlyFire";
import { Direction } from "../geom/Direction";
import { GlobalState } from "../GlobalState";
import { ControllerFamily } from "../input/ControllerFamily";
import { Scene } from "../Scene";
import { ImageNode } from "../scene/ImageNode";
import { TextNode } from "../scene/TextNode";
import { CreditsScene } from "./CreditsScene";

export class EndScene extends Scene<FriendlyFire> {
    @asset(DIALOG_FONT)
    private static readonly font: BitmapFont;

    @asset("images/ending/ff.png")
    private static readonly logo: HTMLImageElement;

    @asset("sounds/ending/boom.mp3")
    private static readonly boom: Sound;

    private readonly subtitleDelay = 2;
    private readonly inputDelay = 4;

    public override setup(): void {
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

    public override activate(): void {
        setTimeout(() => {
            EndScene.boom.setLoop(false);
            EndScene.boom.play();
        }, this.subtitleDelay * 1000);

        setTimeout(() => {
            this.input.onButtonDown.connect(this.gotoCreditsScene, this);
        }, this.inputDelay * 1000);
    }

    public override deactivate(): void {
        this.input.onButtonDown.disconnect(this.gotoCreditsScene, this);
    }

    private async gotoCreditsScene(): Promise<void> {
        await this.game.scenes.setScene(CreditsScene);
    }

    public override cleanup(): void {
        this.rootNode.clear();
    }
}
