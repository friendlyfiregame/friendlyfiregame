import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { Conversation } from "./Conversation";
import conversation from "../assets/dialog/superthrow.dialog.json";
import { entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import { RenderingLayer } from "./Renderer";

@entity("superthrow")
export class SuperThrow extends NPC {
    @asset("sprites/superthrow.aseprite.json")
    private static sprite: Aseprite;
    private floatAmount = 4;
    private floatSpeed = 2;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 18, 22);
        this.setLayer(RenderingLayer.ENTITIES);
        this.lookAtPlayer = false;
        this.conversation = new Conversation(conversation, this);
    }

    public getInteractionText(): string {
        if (!this.met) {
            return "Touch";
        } else {
            return "Talk";
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;

        this.scene.renderer.drawAseprite(
            ctx,
            SuperThrow.sprite,
            "idle",
            0, -floatOffsetY,
            this.direction
        );
    }
}
