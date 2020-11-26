import { Conversation } from "./Conversation";
import { entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import conversation from "./../assets/dialog/window.dialog.json";

@entity("window")
export class Window extends NPC {
    public conversation: Conversation;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 16, 16);
        this.conversation = new Conversation(conversation, this);
    }

    public getInteractionText(): string {
        return "Check window";
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.scene.showBounds) {
            this.drawBounds();
        }
        this.speechBubble.draw(ctx);
    }

    public update(): void {}
}
