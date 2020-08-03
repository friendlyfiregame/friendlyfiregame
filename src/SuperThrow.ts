import { entity } from "./Entity";
import { NPC } from './NPC';
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import conversation from '../assets/dialog/superthrow.dialog.json';
import { Conversation } from './Conversation';
import { RenderingLayer } from './Renderer';

@entity("superthrow")
export class SuperThrow extends NPC {
    @asset("sprites/superthrow.aseprite.json")
    private static sprite: Aseprite;
    private floatAmount = 4;
    private floatSpeed = 2;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 18, 22);
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

    draw(ctx: CanvasRenderingContext2D): void {
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;
        this.scene.renderer.addAseprite(SuperThrow.sprite, "idle", this.x, this.y - floatOffsetY, RenderingLayer.ENTITIES, this.direction);
        if (this.scene.showBounds) this.drawBounds();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
    }
}
