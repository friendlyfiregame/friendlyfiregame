import { NPC } from './NPC';
import { entity } from "./Entity";
import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { Conversation } from './Conversation';
import { Face, EyeType } from './Face';

@entity("stonedisciple")
export class StoneDisciple extends NPC {
    @asset("sprites/stonedisciple.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 32, 26);
        this.direction = -1;
        this.lookAtPlayer = true;
        this.face = new Face(scene, this, EyeType.STONEDISCIPLE, 0, 0);
    }

    protected showDialoguePrompt (): boolean {
        if (!super.showDialoguePrompt()) return false;
        const talkedToStoneDisciple = Conversation.getGlobals()['$talkedToStoneDisciple'];
        const talkedToStoneDiscipleAgain = Conversation.getGlobals()['$talkedToStoneDiscipleAgain'];
        const gotTeleported = Conversation.getGlobals()['$gotTeleported'];
        return (
            talkedToStoneDisciple === undefined ||
            (gotTeleported !== undefined && talkedToStoneDiscipleAgain === undefined)
        );
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }
        StoneDisciple.sprite.drawTag(ctx, "idle", -StoneDisciple.sprite.width >> 1, -StoneDisciple.sprite.height, this.scene.gameTime * 1000);
        ctx.restore();
        this.drawFace(ctx, false);
        if (this.scene.showBounds) this.drawBounds();
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.dialoguePrompt.update(dt, this.x, this.y + this.height);
        this.speechBubble.update(this.x, this.y);
    }
}
