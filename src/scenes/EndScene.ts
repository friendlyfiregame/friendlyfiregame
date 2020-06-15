import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { asset } from "../Assets";
import { Aseprite } from "../Aseprite";
import { BitmapFont } from "../BitmapFont";
import { ControllerEvent } from "../input/ControllerEvent";
import { ControllerFamily } from "../input/ControllerFamily";
import { Quest } from '../Quests';
import { CreditsScene } from './CreditsScene';

export class EndScene extends Scene<FriendlyFire> {
    @asset("images/end.png")
    private static endImage: HTMLImageElement;

    @asset("sprites/flameboy2.aseprite.json")
    private static endBoy: Aseprite;

    @asset("fonts/standard.font.json")
    private static font: BitmapFont;

    private ending: Quest | undefined = this.game.campaign.quests.find(q => q.isFinished());

    public activate(): void {
        console.log(this.ending);
        this.input.onButtonDown.connect(this.handleButtonDown, this);
    }

    public deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
    }

    private handleButtonDown(event: ControllerEvent): void {
        this.game.scenes.setScene(CreditsScene);
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.save();
        ctx.beginPath();
        ctx.drawImage(EndScene.endImage, 0, 0);
        ctx.translate(240, 222);
        ctx.scale(2, 2);
        EndScene.endBoy.drawTag(ctx, "idle", -EndScene.endBoy.width >> 1, -EndScene.endBoy.height);
        ctx.restore();
        ctx.restore();
        const endingLabel = this.ending ? this.ending.title : '';
        EndScene.font.drawTextWithOutline(ctx, endingLabel, 0, 0, "white", "black");

        // Inform the user, that it's possible to return to the title...
        const txt = `Press any ${this.input.currentControllerFamily === ControllerFamily.KEYBOARD ? "key" : "button"} to return to title.`;
        const txtSize = EndScene.font.measureText(txt);
        EndScene.font.drawTextWithOutline(ctx, txt, width / 2 - txtSize.width / 2 , height - txtSize.height - 4, "white", "black");

    }

}
