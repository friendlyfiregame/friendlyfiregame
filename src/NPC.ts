import { Face, FaceModes } from './Face';
import { Greeting } from './Greeting';
import { PhysicsEntity } from "./PhysicsEntity";
import { SpeechBubble } from './SpeechBubble';
import { Conversation } from './Conversation';

// Seconds where NPC can't be talked to after an ended conversation
const PAUSE_AFTER_CONVERSATION = 1.5;

export abstract class NPC extends PhysicsEntity {
    public direction = 1;
    public face: Face | null = null;
    public defaultFaceMode = FaceModes.NEUTRAL;
    public greeting: Greeting | null = null;
    public conversation: Conversation | null = null;
    public speechBubble = new SpeechBubble(this.game, this.x, this.y, "white");
    public lookAtPlayer = false;
    private lastEndedConversation = -Infinity;

    protected drawFace(ctx: CanvasRenderingContext2D, lookAtPlayer = true): void {
        if (this.face) {
            // Look at player
            if (lookAtPlayer) {
                const dx = this.game.player.x - this.x;
                this.face.toggleDirection((dx > 0) ? 1 : -1);
                this.face.draw(ctx);
            } else {
                this.face.setDirection(this.direction);
                this.face.draw(ctx);
            }
        }
    }

    public async load(): Promise<void> {
        if (this.face) {
            await this.face.load();
        }
    }

    protected drawGreeting(ctx: CanvasRenderingContext2D): void {
        this.greeting?.draw(ctx);
    }

    protected updateGreeting(dt: number) {
        this.greeting?.update(dt);
    }

    public registerEndedConversation() {
        this.lastEndedConversation = this.game.gameTime;
    }

    public isReadyForConversation() {
        return this.conversation && this.game.gameTime - this.lastEndedConversation > PAUSE_AFTER_CONVERSATION;
    }

    public toggleDirection(direction = this.direction > 0 ? -1 : 1) {
        if (direction !== this.direction) {
            this.direction = direction;
        }
    }

    public update(dt: number): void {
        const dx = this.game.player.x - this.x;
        this.toggleDirection((dx > 0) ? 1 : -1);
        super.update(dt);
    }
}
