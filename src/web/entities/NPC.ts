import { type Conversation } from "../Conversation";
import { DialoguePrompt } from "../DialoguePrompt";
import { type Face, FaceModes } from "../Face";
import { type Greeting } from "../Greeting";
import { SpeechBubble } from "../SpeechBubble";
import { sleep } from "../util";
import { PhysicsEntity, type PhysicsEntityArgs } from "./PhysicsEntity";

// Seconds NPC can't be talked to after a conversation has ended
const PAUSE_AFTER_CONVERSATION = 1.5;

export class NPC extends PhysicsEntity {
    public direction = 1;
    public face: Face | null = null;
    public defaultFaceMode = FaceModes.NEUTRAL;
    public greeting: Greeting | null = null;
    public conversation: Conversation | null = null;
    public thinkBubble: SpeechBubble | null = null;
    public speechBubble = new SpeechBubble(this.scene, this.x, this.y);
    public lookAtPlayer = true;
    public dialoguePrompt = new DialoguePrompt({ scene: this.scene, x: 0, y: 0 }).appendTo(this);
    private lastEndedConversation = -Infinity;
    protected met = false;

    public constructor(args: PhysicsEntityArgs) {
        super({ ...args, reversed: true });
    }

    protected drawFace(lookAtPlayer = true): void {
        if (this.face) {
            // Look at player
            if (lookAtPlayer) {
                const dx = this.scene.player.x - this.x;
                this.face.toggleDirection((dx > 0) ? 1 : -1);
                this.face.draw();
            } else {
                this.face.setDirection(this.direction);
                this.face.draw();
            }
        }
    }

    public async think(message: string, time: number): Promise<void> {
        if (this.thinkBubble) {
            this.thinkBubble.hide();
            this.thinkBubble = null;
        }

        const thinkBubble = this.thinkBubble = new SpeechBubble(this.scene, this.x, this.y);
        void thinkBubble.setMessage(message);
        thinkBubble.show();

        await sleep(time);

        if (this.thinkBubble === thinkBubble) {
            thinkBubble.hide();
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

    protected drawGreeting(): void {
        this.greeting?.render();
    }

    protected updateGreeting(): void {
        this.greeting?.update();
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

    public override update(dt: number): void {
        if (this.lookAtPlayer) {
            const dx = this.scene.player.x - this.x;
            this.toggleDirection((dx > 0) ? 1 : -1);
        }

        super.update(dt);
    }
}
