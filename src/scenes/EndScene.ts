import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { asset } from "../Assets";
import { CurtainTransition } from "../transitions/CurtainTransition";
import { easeOutSine } from "../easings";
import { Aseprite } from "../Aseprite";

export class EndScene extends Scene<FriendlyFire> {
    @asset("images/end.png")
    private static endImage: HTMLImageElement;

    @asset("sprites/flameboy2.aseprite.json")
    private static endBoy: Aseprite;

    public setup(): void {
        this.zIndex = 1;
        this.inTransition = new CurtainTransition({ reverse: true, easing: easeOutSine });
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();
        ctx.beginPath();
        ctx.drawImage(EndScene.endImage, 0, 0);
        ctx.translate(240, 222);
        ctx.scale(2, 2);
        EndScene.endBoy.drawTag(ctx, "idle", -EndScene.endBoy.width >> 1, -EndScene.endBoy.height);
        ctx.restore();
        ctx.restore();
    }
}
