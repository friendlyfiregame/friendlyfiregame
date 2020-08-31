import { asset } from '../Assets';
import { BitmapFont } from '../BitmapFont';
import { ControllerFamily } from '../input/ControllerFamily';
import { CreditsScene } from './CreditsScene';
import { DIALOG_FONT } from '../constants';
import { FriendlyFire } from '../FriendlyFire';
import { Quest } from '../Quests';
import { Scene } from '../Scene';
import { Sound } from '../Sound';

export class EndScene extends Scene<FriendlyFire> {
    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    @asset("images/ending/ff.png")
    private static logo: HTMLImageElement;

    @asset("sounds/ending/boom.mp3")
    private static boom: Sound;

    private ending: Quest | undefined = this.game.campaign.quests.find(q => q.isFinished());
    private time = 0;
    private boomPlayed = false;
    private subtitleDelay = 2;
    private inputDelay = 4;

    public activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
    }

    public deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
    }

    private handleButtonDown(): void {
        if (this.time > this.inputDelay) {
            this.game.scenes.setScene(CreditsScene);
        }
    }

    public update(dt: number) {
        this.time += dt;

        if (this.time > this.subtitleDelay && !this.boomPlayed) {
            EndScene.boom.setLoop(false);
            EndScene.boom.play();
            this.boomPlayed = true;
        }
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.drawImage(
            EndScene.logo,
            width / 2 - EndScene.logo.width / 2, height / 2 - EndScene.logo.height / 2 - 15
        );

        if (this.time > this.subtitleDelay) {
            const endingLabel = this.ending ? this.ending.title : 'Unknown [E]nding';
            const size = EndScene.font.measureText(endingLabel);

            EndScene.font.drawText(
                ctx,
                endingLabel,
                width / 2 - size.width / 2, height / 2 - EndScene.logo.height / 2 + 20,
                "red"
            );
        }

        // Inform the user, that it's possible to return to the title
        if (this.time > this.inputDelay) {
            const txt = `Press any ${this.input.currentControllerFamily === ControllerFamily.KEYBOARD ? "key" : "button"} to continue.`;
            const txtSize = EndScene.font.measureText(txt);

            EndScene.font.drawText(
                ctx,
                txt,
                width / 2 - txtSize.width / 2 , height - txtSize.height - 15,
                "darkgrey"
            );
        }
    }
}
