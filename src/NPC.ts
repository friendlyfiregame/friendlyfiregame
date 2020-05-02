import { Face, FaceModes } from './Face';
import { Greeting } from './Greeting';
import { PhysicsEntity } from "./PhysicsEntity";
import { SpeechBubble } from './SpeechBubble';
import { Conversation } from './Conversation';
import { DialoguePrompt } from './DialoguePrompt';

// Seconds where NPC can't be talked to after an ended conversation
const PAUSE_AFTER_CONVERSATION = 1.5;

export abstract class NPC extends PhysicsEntity {
    public direction = 1;
    public face: Face | null = null;
    public defaultFaceMode = FaceModes.NEUTRAL;
    public greeting: Greeting | null = null;
    public conversation: Conversation | null = null;
    public speechBubble = new SpeechBubble(this.scene, this.x, this.y, "white");
    public lookAtPlayer = true;
    public dialoguePrompt = new DialoguePrompt(this.x, this.y);
    private lastEndedConversation = -Infinity;

    protected drawFace(ctx: CanvasRenderingContext2D, lookAtPlayer = true): void {
        if (this.face) {
            // Look at player
            if (lookAtPlayer) {
                const dx = this.scene.player.x - this.x;
                this.face.toggleDirection((dx > 0) ? 1 : -1);
                this.face.draw(ctx);
            } else {
                this.face.setDirection(this.direction);
                this.face.draw(ctx);
            }
        }
    }

    protected drawDialoguePrompt (ctx: CanvasRenderingContext2D): void {
        this.dialoguePrompt.draw(ctx);
    }

    protected drawGreeting(ctx: CanvasRenderingContext2D): void {
        this.greeting?.draw(ctx);
    }

    protected updateGreeting(dt: number) {
        this.greeting?.update(dt);
    }

    public registerEndedConversation() {
        this.lastEndedConversation = this.scene.gameTime;
    }

    public isReadyForConversation() {
        return this.conversation && this.scene.gameTime - this.lastEndedConversation > PAUSE_AFTER_CONVERSATION;
    }

    public toggleDirection(direction = this.direction > 0 ? -1 : 1) {
        if (direction !== this.direction) {
            this.direction = direction;
        }
    }

    public update(dt: number): void {
        if (this.lookAtPlayer) {
            const dx = this.scene.player.x - this.x;
            this.toggleDirection((dx > 0) ? 1 : -1);
        }
        super.update(dt);
    }
}
