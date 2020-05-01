import { entity } from "./Entity";
import { Game } from "./game";
import { NPC } from './NPC';
import { Face, EyeType, FaceModes } from './Face';
import { Aseprite } from './Aseprite';
import { Milestone } from './Player';

@entity("flameboy")
export class FlameBoy extends NPC {
    private sprite!: Aseprite;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 26, 54);
        this.face = new Face(this, EyeType.FLAMEBOY, 1, 0, 5);
        this.defaultFaceMode = FaceModes.BORED
        this.face.setMode(this.defaultFaceMode);
    }

    public async load(): Promise<void> {
        this.sprite = await Aseprite.load("assets/sprites/flameboy.aseprite.json");
    }

    private showDialoguePrompt (): boolean {
        return (
            this.game.player.getMilestone() >= Milestone.THROWN_STONE_INTO_WATER &&
            this.game.player.getMilestone() < Milestone.GOT_MULTIJUMP
        );
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);
        this.sprite.drawTag(ctx, "idle", -this.sprite.width >> 1, -this.sprite.height);
        ctx.restore();
        this.drawFace(ctx, false);
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.dialoguePrompt.update(dt, this.x, this.y + 32);
        this.speechBubble.update(this.x, this.y);
    }
}
