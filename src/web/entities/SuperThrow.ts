import conversation from "../../../assets/dialog/superthrow.dialog.json";
import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import { entity, type EntityArgs } from "../Entity";
import { RenderingLayer } from "../Renderer";
import { NPC } from "./NPC";

@entity("SuperThrow")
export class SuperThrow extends NPC {
    @asset("sprites/superthrow.aseprite.json")
    private static readonly sprite: Aseprite;
    private readonly floatAmount = 4;
    private readonly floatSpeed = 2;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 18, height: 22 });
        this.lookAtPlayer = false;
        this.conversation = new Conversation(conversation, this);
    }

    public override getInteractionText(): string {
        if (!this.met) {
            return "Touch";
        } else {
            return "Talk";
        }
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;

        this.scene.renderer.addAseprite(
            SuperThrow.sprite,
            "idle",
            this.x, this.y + floatOffsetY,
            RenderingLayer.ENTITIES,
            this.direction
        );

        this.speechBubble.draw(ctx);
    }

    public override update(dt: number): void {
        super.update(dt);

        this.speechBubble.update(this.x, this.y);
    }
}
