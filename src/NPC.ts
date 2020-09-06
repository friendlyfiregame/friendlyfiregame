import { Conversation } from "./Conversation";
import { DialoguePrompt } from "./DialoguePrompt";
import { Face, FaceModes } from "./Face";
import { PhysicsEntity } from "./PhysicsEntity";
import { sleep } from "./util";
import { SpeechBubble } from "./SpeechBubble";

// Seconds NPC can't be talked to after a conversation has ended
const PAUSE_AFTER_CONVERSATION = 1.5;

export abstract class NPC extends PhysicsEntity {
    public direction = 1;
    public face: Face | null = null;
    public defaultFaceMode = FaceModes.NEUTRAL;
    public conversation: Conversation | null = null;
    public thinkBubble: SpeechBubble | null = null;
    public speechBubble = new SpeechBubble(this.scene).appendTo(this);
    public lookAtPlayer = true;
    public dialoguePrompt = new DialoguePrompt(this.scene);
    private lastEndedConversation = -Infinity;
    protected met = false;

    public async think(message: string, time: number): Promise<void> {
        if (this.thinkBubble) {
            this.thinkBubble.hide();
            this.thinkBubble.remove();
            this.thinkBubble = null;
        }

        const thinkBubble = this.thinkBubble = new SpeechBubble(this.scene).appendTo(this);
        thinkBubble.setMessage(message);
        thinkBubble.show();

        await sleep(time);

        if (this.thinkBubble === thinkBubble) {
            thinkBubble.hide();
            this.thinkBubble.remove();
            this.thinkBubble = null;
        }
    }

    public hasMet(): boolean {
        return false;
    }

    public meet(): void {
        this.met = true;
    }

    public getInteractionText(): string {
        return "Talk";
    }

    protected showDialoguePrompt(): boolean {
        if (this.hasActiveConversation() || !this.scene.player.isControllable) {
            return false;
        }

        return true;
    }

    public registerEndedConversation(): void {
        this.lastEndedConversation = this.scene.gameTime;
    }

    public isReadyForConversation(): boolean | null {
        return (
            this.conversation
            && !this.scene.player.isCarrying(this)
            && this.scene.gameTime - this.lastEndedConversation > PAUSE_AFTER_CONVERSATION
        );
    }

    public hasActiveConversation(): boolean {
        return (this.scene.player.playerConversation !== null && this.scene.player.playerConversation.npc === this);
    }

    public toggleDirection(direction = this.direction > 0 ? -1 : 1): void {
        if (direction !== this.direction) {
            this.direction = direction;
        }
    }

    public update(dt: number): void {
        if (this.lookAtPlayer) {
            const dx = this.scene.player.x - this.x;
            this.toggleDirection((dx > 0) ? 1 : -1);
        }
        if (this.showDialoguePrompt()) {
            if (this.dialoguePrompt.getParent() !== this) {
                this.dialoguePrompt.appendTo(this);
            }
        } else {
            this.dialoguePrompt.remove();
        }

        super.update(dt);
    }
}
