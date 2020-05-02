import { entity } from "./Entity";
import { NPC } from './NPC';
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";
import { Milestone } from './Player';
import { GameScene } from "./scenes/GameScene";

@entity("wing")
export class Wing extends NPC {
    @asset("sprites/wing.aseprite.json")
    private static sprite: Aseprite;

    private timeAlive = 0;

    private floatAmount = 4;
    private floatSpeed = 2;

    public constructor(game: GameScene, x: number, y:number) {
        super(game, x, y, 24, 24);
    }

    private showDialoguePrompt (): boolean {
        return (
            this.scene.player.getMilestone() >= Milestone.GOT_MULTIJUMP &&
            this.scene.player.getMilestone() < Milestone.MADE_RAIN
        );
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;
        ctx.translate(this.x, -this.y - floatOffsetY);
        Wing.sprite.drawTag(ctx, "idle", -Wing.sprite.width >> 1, -Wing.sprite.height);
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
