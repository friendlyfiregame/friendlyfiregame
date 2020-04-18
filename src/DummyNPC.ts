import { Dialog, Message } from "./Dialog";
import { NPC } from './NPC';
import { SpeechBubble } from "./SpeechBubble";

export class DummyNPC extends NPC {
    private activeDialog: Dialog | null = null;
    public activeSpeechBubble: SpeechBubble | null = null;
    private infoText = "Hi";
    private infoTextRange = 65;
    private infoTextActive = false;
    private infoTextDistance = 15;

    async load(): Promise<void> {
        this.width = 20;
        this.height = 30;
        this.hasDialog = true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.strokeText("NPC", this.x - (this.width / 2), -this.y - this.height);
        ctx.strokeRect(this.x - (this.width / 2), -this.y - this.height, this.width, this.height);
        ctx.restore();
        this.activeSpeechBubble?.draw(ctx, this.x, this.y + 30);
    }

    drawTextBox(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "white";
        if (this.activeSpeechBubble) {
            return
        }
        ctx.strokeText(this.infoText, this.x - (this.width / 2), -this.y - (this.height + this.infoTextDistance));
        ctx.strokeRect(this.x - (this.width / 2), -this.y - this.height - this.infoTextDistance - 15, this.width, 20);
        ctx.restore();
    }

    update(dt: number): void {
        const isInRange = this.game.player.distanceTo(this) < this.infoTextRange;
        if (isInRange && !this.infoTextActive) {
            this.startDialog();
        } else if (!isInRange) {
            this.activeSpeechBubble = null;
            this.game.player.activeSpeechBubble = null;
            this.activeDialog = null;
        }
        this.infoTextActive = isInRange;
    }

    startDialog(): void {
        if (this.hasDialog && !this.activeDialog) {
            const someConversation: Array<Message> = [
                { entity: "player", text: "Hello block.\nDo you have a task for me?" },
                { entity: "other", text: "Sure, Player 1. Just follow me." },
                { entity: "player", text: "Sure." },
                { entity: "other", text: "You ready?" },
                { entity: "player", text: "Sure." },
                { entity: "other", text: "Thanks for your help." },
                { entity: "player", text: "You're welcome." },
                { entity: "other", text: "Bye." },
            ]
            this.activeDialog = new Dialog(someConversation, this.game.player, this);
            this.getNextConversationPart();
        } else if (this.activeDialog) {
            this.getNextConversationPart();
        }
    }

    getNextConversationPart(): void {
        if (this.activeDialog && this.activeDialog.getNextMessage()) {
            this.activeSpeechBubble = this.activeDialog.getSpeechBubbleForEntity();
            this.game.player.activeSpeechBubble = this.activeDialog.getSpeechBubbleForPlayer();
        } else {
            this.activeSpeechBubble = null;
            this.game.player.activeSpeechBubble = null;
            this.activeDialog = null;
        }
    }
}
