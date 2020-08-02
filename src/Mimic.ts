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
        this.direction = 1;
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
        if (this.scene.showBounds) this.drawBounds();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);

        switch (this.state) {
            case MimicState.SLEEPING: this.animator.play("sleeping", this.direction); break;
            case MimicState.OPEN_UP: this.animator.play("open", this.direction, { playUntilFinished: true }); this.nextState(); break;
            case MimicState.IDLE: this.animator.play("idle", this.direction);
        }

        if (this.state === MimicState.OPEN_UP) Mimic.openingSound.play();
        this.speechBubble.update(this.x, this.y);
    }
}
