import { Face } from './Face';
import { Greeting } from './Greeting';
import { PhysicsEntity } from "./PhysicsEntity";
import { SpeechBubble } from './SpeechBubble';
import { Conversation } from './Conversation';

export abstract class NPC extends PhysicsEntity {
    public face: Face | null = null;
    public greeting: Greeting | null = null;
    public conversation: Conversation | null = null;
    public speechBubble = new SpeechBubble(this.game, this.x, this.y, "white");

    protected drawFace(ctx: CanvasRenderingContext2D): void {
        if (this.face) {
            // Look at player
            const dx = this.game.player.x - this.x;
            this.face.toggleDirection((dx > 0) ? 1 : -1);
            this.face.draw(ctx);
        }
    }

    protected drawGreeting(ctx: CanvasRenderingContext2D): void {
        this.greeting?.draw(ctx);
    }

    protected updateGreeting(dt: number) {
        this.greeting?.update(dt);
    }
}
