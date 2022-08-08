import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import conversation from "../../assets/dialog/superthrow.dialog.json";
import { entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import { NPC } from "./NPC";

@entity("superthrow")
export class SuperThrow extends NPC {
    @asset("sprites/superthrow.aseprite.json")
    private static sprite: Aseprite;
    private floatAmount = 4;
    private floatSpeed = 2;
    private isBeingDisintegrated = false;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 18, 22);
        this.lookAtPlayer = false;
        this.conversation = new Conversation(conversation, this);
        this.animator.assignSprite(SuperThrow.sprite);
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

        if (this.isBeingDisintegrated) {
            this.animator.play("disintegrate", this.direction, { loop: false, callback: this.grantWeirdThrow.bind(this) });
        } else {
            this.animator.addOffset(0, floatOffsetY).play("idle", this.direction);
        }

        // this.scene.renderer.addAseprite(
        //     SuperThrow.sprite,
        //     "idle",
        //     this.x, this.y - floatOffsetY,
        //     RenderingLayer.ENTITIES,
        //     this.direction
        // );

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        this.speechBubble.draw(ctx);
    }

    public update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
    }

    public pickupAgainstWill (): void {
        this.isBeingDisintegrated = true;
    }

    private grantWeirdThrow (): void {
        this.scene.player.enableWeirdThrow();
        this.scene.removeGameObject(this);
    }
}
