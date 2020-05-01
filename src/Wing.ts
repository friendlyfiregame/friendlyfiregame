import { entity } from "./Entity";
import { Game } from "./game";
import { NPC } from './NPC';
import { Aseprite } from './Aseprite';
import { Milestone } from './Player';

@entity("wing")
export class Wing extends NPC {
    private sprite!: Aseprite;
    private timeAlive = 0;

    private flaotAmount = 4;
    private floatSpeed = 2;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 24, 24);
    }

    public async load(): Promise<void> {
        this.sprite = await Aseprite.load("assets/sprites/wing.aseprite.json");
    }

    private showDialoguePrompt (): boolean {
        return (
            this.game.player.getMilestone() >= Milestone.GOT_MULTIJUMP &&
            this.game.player.getMilestone() < Milestone.MADE_RAIN
        );
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.flaotAmount;
        ctx.translate(this.x, -this.y - floatOffsetY);
        this.sprite.drawTag(ctx, "idle", -this.sprite.width >> 1, -this.sprite.height);
        ctx.restore();
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.timeAlive += dt;
        this.dialoguePrompt.update(dt, this.x, this.y + 16);
        this.speechBubble.update(this.x, this.y);
    }
}
