import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { Conversation } from "./Conversation";
import conversation from "../assets/dialog/chicken.dialog.json";
import { entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import { RenderingLayer } from "./RenderingLayer";

@entity("chicken")
export class Chicken extends NPC {
    @asset("sprites/chicken.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 24, 18);
        this.setLayer(RenderingLayer.ENTITIES);
        this.lookAtPlayer = false;
        this.conversation = new Conversation(conversation, this);
    }

    public showDialoguePrompt(): boolean {
        return false;
    }

    public getInteractionText(): string {
        if (!this.met) {
            return "Touch";
        } else {
            return "Talk";
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.scale(this.direction, 1);
        Chicken.sprite.drawTag(ctx, "idle", -Chicken.sprite.width >> 1, -Chicken.sprite.height);
        ctx.restore();
    }
}
