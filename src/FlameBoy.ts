import { entity } from "./Entity";
import { Game } from "./game";
import { NPC } from './NPC';
import { Face, EyeType, FaceModes } from './Face';
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";

@entity("flameboy")
export class FlameBoy extends NPC {
    @asset("sprites/flameboy.aseprite.json")
    private static sprite: Aseprite;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 26, 54);
        this.face = new Face(this, EyeType.FLAMEBOY, 0, 5);
        this.defaultFaceMode = FaceModes.BORED
        this.face.setMode(this.defaultFaceMode);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);
        FlameBoy.sprite.drawTag(ctx, "idle", -FlameBoy.sprite.width >> 1, -FlameBoy.sprite.height);
        ctx.restore();
        this.drawFace(ctx, false);
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
    }
}
