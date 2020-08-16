import { Conversation } from './Conversation';
import { DialoguePrompt } from './DialoguePrompt';
import { Face, FaceModes } from './Face';
import { Greeting } from './Greeting';
import { PhysicsEntity } from './PhysicsEntity';
import { Point } from './Geometry';
import { sleep } from './util';
import { SpeechBubble } from './SpeechBubble';

// Seconds NPC can't be talked to after a conversation has ended
const PAUSE_AFTER_CONVERSATION = 1.5;

export abstract class NPC extends PhysicsEntity {
    public direction = 1;
    public face: Face | null = null;
    public defaultFaceMode = FaceModes.NEUTRAL;
    public greeting: Greeting | null = null;
    public conversation: Conversation | null = null;
    public thinkBubble: SpeechBubble | null = null;
    public speechBubble = new SpeechBubble(this.scene, new Point(this.position.x, this.position.y));
    public lookAtPlayer = true;
    public dialoguePrompt = new DialoguePrompt(this.scene, this.position);
    private lastEndedConversation = -Infinity;
    protected met = false;

    protected drawFace(ctx: CanvasRenderingContext2D, lookAtPlayer = true): void {
        if (this.face) {
            // Look at player
            if (lookAtPlayer) {
                const dx = this.scene.player.position.x - this.position.x;
                this.face.toggleDirection((dx > 0) ? 1 : -1);
                this.face.draw(ctx);
            } else {
                this.face.setDirection(this.direction);
                this.face.draw(ctx);
            }
        }
    }

    public async think(message: string, time: number): Promise<void> {
        if (this.thinkBubble) {
            this.thinkBubble.hide();
            this.thinkBubble = null;
        }
        const thinkBubble = this.thinkBubble = new SpeechBubble(this.scene, this.position.clone());
        thinkBubble.setMessage(message);
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

    public getInteractionText (): string {
        return "Talk";
    }

    protected showDialoguePrompt (): boolean {
        if (this.hasActiveConversation() || !this.scene.player.isControllable) return false;
        return true;
    }

    protected drawDialoguePrompt (ctx: CanvasRenderingContext2D): void {
        this.dialoguePrompt.draw();
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
        return (this.conversation && !this.scene.player.isCarrying(this) && this.scene.gameTime - this.lastEndedConversation > PAUSE_AFTER_CONVERSATION);
    }

    public hasActiveConversation(): boolean {
        return (this.scene.player.playerConversation !== null && this.scene.player.playerConversation.npc === this);
    }

    public toggleDirection(direction = this.direction > 0 ? -1 : 1) {
        if (direction !== this.direction) {
            this.direction = direction;
        }
    }

    public update(dt: number): void {
        if (this.lookAtPlayer) {
            const dx = this.scene.player.position.x - this.position.x;
            this.toggleDirection((dx > 0) ? 1 : -1);
        }
        super.update(dt);
    }
}
