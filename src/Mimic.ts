import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { Conversation } from "./Conversation";
import conversation from "../assets/dialog/mimic.dialog.json";
import { entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import { Sound } from "./Sound";
import { RenderingLayer } from "./Renderer";

enum MimicState { SLEEPING, OPEN_UP, IDLE }

@entity("mimic")
export class Mimic extends NPC {
    @asset("sprites/mimic.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/item/chest.ogg")
    private static openingSound: Sound;

    private state = MimicState.SLEEPING;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 46, 24);
        this.setLayer(RenderingLayer.ENTITIES);
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

    public getInteractionText(): string {
        if (!this.met) {
            return "Open";
        } else {
            return "Talk";
        }
    }

    public showDialoguePrompt(): boolean {
        return false;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        switch (this.state) {
            case MimicState.SLEEPING:
                this.animator.play("sleeping", ctx, this.direction);
                break;
            case MimicState.OPEN_UP:
                this.animator.play("open", ctx, this.direction, { loop: false, callback: this.nextState.bind(this) });
                break;
            case MimicState.IDLE:
                this.animator.play("idle", ctx, this.direction);
                break;
        }
    }
}
