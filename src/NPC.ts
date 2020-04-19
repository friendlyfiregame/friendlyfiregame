import { Entity } from './Entity';
import { Face } from './Face';
import { SpeechBubble } from './SpeechBubble';
import { Vector2 } from './util';

export abstract class NPC extends Entity {
    public hasDialog = false;
    public face: Face | null = null;

    protected greetingText = "";
    protected greetingRange = 65;
    protected greetingActive = false;
    /* used to prevent multiple greetings, e.g after a dialog has ended */
    protected greetingShown = false;
    protected greetingOffset: Vector2 = {x: 0, y: 40};
    protected greetingBubble = new SpeechBubble(
        this.game,
        this.x + this.greetingOffset.x,
        this.y + this.greetingOffset.y,
        "white",
        false,
        this.greetingText
    );

    abstract startDialog(): void;

    protected drawFace(ctx: CanvasRenderingContext2D): void {
        if (this.face) {
            this.face.draw(ctx);
        }
    }

    protected drawGreeting(ctx: CanvasRenderingContext2D): void {
        if (this.greetingActive && this.greetingText !== "") {
            this.greetingBubble.message = this.greetingText;
            this.greetingBubble.draw(ctx, this.x + this.greetingOffset.x, this.y + this.greetingOffset.y);
        }
    }
}
