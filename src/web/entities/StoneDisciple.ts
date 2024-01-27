import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import { entity, type EntityArgs } from "../Entity";
import { EyeType, Face } from "../Face";
import { RenderingLayer } from "../Renderer";
import { NPC } from "./NPC";

@entity("stonedisciple")
export class StoneDisciple extends NPC {
    @asset("sprites/stonedisciple.aseprite.json")
    private static readonly sprite: Aseprite;

    public constructor(args: EntityArgs) {
        super({ width: 32, height: 26, ...args });
        this.direction = -1;
        this.lookAtPlayer = true;
        this.face = new Face(this.scene, this, EyeType.STONEDISCIPLE, 0, 0);
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

    public override draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(
            StoneDisciple.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES, this.direction
        );

        this.drawFace(ctx, false);

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
