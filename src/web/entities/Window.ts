import { Conversation } from "../Conversation";
import { entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import conversation from "./../../../assets/dialog/window.dialog.json";
import { NPC } from "./NPC";

@entity("window")
export class Window extends NPC {
    public override conversation: Conversation;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 16, 16);
        this.conversation = new Conversation(conversation, this);
    }

    public override getInteractionText(): string {
        return "Check window";
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.scene.showBounds) {
            this.drawBounds();
        }
        this.speechBubble.draw(ctx);
    }

    public override update(): void {}
}
