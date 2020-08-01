import { entity } from "./Entity";
import { NPC } from './NPC';
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import conversation from '../assets/dialog/mimic.dialog.json';
import { Conversation } from './Conversation';
import { Sound } from './Sound';

enum MimicState { SLEEPING, OPEN_UP, IDLE }

@entity("mimic")
export class Mimic extends NPC {
    @asset("sprites/mimic.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/item/chest.ogg")
    private static openingSound: Sound;

    private state = MimicState.SLEEPING;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 46, 24);
        this.lookAtPlayer = false;
        this.conversation = new Conversation(conversation, this);
        this.animator.assignSprite(Mimic.sprite);
    }

    public nextState (): void {
        this.state++;
    }

    public getInteractionText(): string {
        if (!this.met) {
            return "Open";
        } else {
            return "Talk";
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }
        switch (this.state) {
            case MimicState.SLEEPING: this.animator.play("sleeping", ctx); break;
            case MimicState.OPEN_UP: this.animator.play("open", ctx, { playUntilFinished: true }); this.nextState(); break;
            case MimicState.IDLE: this.animator.play("idle", ctx);
        }
        ctx.restore();
        if (this.scene.showBounds) this.drawBounds(ctx);
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        if (this.state === MimicState.OPEN_UP) Mimic.openingSound.play();
        this.speechBubble.update(this.x, this.y);
    }
}
