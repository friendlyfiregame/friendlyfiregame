import { Conversation } from "../Conversation";
import { entity, type EntityArgs } from "../Entity";
import conversation from "./../../../assets/dialog/window.dialog.json";
import { NPC } from "./NPC";

@entity("window")
export class Window extends NPC {
    public override conversation: Conversation;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 16, height: 16 });
        this.conversation = new Conversation(conversation, this);
    }

    public override getInteractionText(): string {
        return "Check window";
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        this.speechBubble.draw(ctx);
    }

    public override update(): void {}
}
