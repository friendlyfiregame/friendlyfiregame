import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import { entity } from "../Entity";
import { EyeType, Face } from "../Face";
import { GameScene } from "../scenes/GameScene";
import { NPC } from "./NPC";
import { RenderingLayer } from "../Renderer";

@entity("stonedisciple")
export class StoneDisciple extends NPC {
    @asset("sprites/stonedisciple.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 32, 26);
        this.direction = -1;
        this.lookAtPlayer = true;
        this.face = new Face(scene, this, EyeType.STONEDISCIPLE, 0, 0);
    }

    protected override showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        const talkedToStoneDisciple = Conversation.getGlobals()["$talkedToStoneDisciple"];
        const talkedToStoneDiscipleAgain = Conversation.getGlobals()["$talkedToStoneDiscipleAgain"];
        const gotTeleported = Conversation.getGlobals()["$gotTeleported"];

        return (
            talkedToStoneDisciple === undefined
            || (gotTeleported !== undefined && talkedToStoneDiscipleAgain === undefined)
        );
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(
            StoneDisciple.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES, this.direction
        );

        this.drawFace(ctx, false);

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        this.speechBubble.draw(ctx);
    }

    public override update(dt: number): void {
        super.update(dt);

        this.dialoguePrompt.update(dt, this.x, this.y + this.height);
        this.speechBubble.update(this.x, this.y);
    }
}
