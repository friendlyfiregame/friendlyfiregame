import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import conversation from "../../../assets/dialog/superthrow.dialog.json";
import { entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import { NPC } from "./NPC";
import { RenderingLayer } from "../Renderer";

@entity("superthrow")
export class SuperThrow extends NPC {
    @asset("sprites/superthrow.aseprite.json")
    private static readonly sprite: Aseprite;
    private readonly floatAmount = 4;
    private readonly floatSpeed = 2;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 18, 22);
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

    public draw(ctx: CanvasRenderingContext2D): void {
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;

        this.scene.renderer.addAseprite(
            SuperThrow.sprite,
            "idle",
            this.x, this.y - floatOffsetY,
            RenderingLayer.ENTITIES,
            this.direction
        );

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        this.speechBubble.draw(ctx);
    }

    public override update(dt: number): void {
        super.update(dt);

        this.speechBubble.update(this.x, this.y);
    }
}
