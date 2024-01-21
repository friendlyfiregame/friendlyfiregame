import conversation from "../../../assets/dialog/mimic.dialog.json";
import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Sound } from "../audio/Sound";
import { Conversation } from "../Conversation";
import { entity, type EntityArgs } from "../Entity";
import { NPC } from "./NPC";

enum MimicState { SLEEPING, OPEN_UP, IDLE }

@entity("mimic")
export class Mimic extends NPC {
    @asset("sprites/mimic.aseprite.json")
    private static readonly sprite: Aseprite;

    @asset("sounds/item/chest.ogg")
    private static readonly openingSound: Sound;

    private state = MimicState.SLEEPING;

    public constructor(args: EntityArgs) {
        super({ width: 46, height: 24, ...args });
        this.lookAtPlayer = false;
        this.direction = 1;
        this.conversation = new Conversation(conversation, this);
        this.animator.assignSprite(Mimic.sprite);
    }

    public nextState(): void {
        this.state++;

        if (this.state === MimicState.OPEN_UP) {
            Mimic.openingSound.play();
        }
    }

    public override getInteractionText(): string {
        if (!this.met) {
            return "Open";
        } else {
            return "Talk";
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.scene.showBounds) {
            this.drawBounds();
        }

        switch (this.state) {
            case MimicState.SLEEPING:
                this.animator.play("sleeping", this.direction);
                break;
            case MimicState.OPEN_UP:
                this.animator.play("open", this.direction, { loop: false, callback: this.nextState.bind(this) });
                break;
            case MimicState.IDLE:
                this.animator.play("idle", this.direction);
                break;
        }

        this.speechBubble.draw(ctx);
    }

    public override update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
    }
}
