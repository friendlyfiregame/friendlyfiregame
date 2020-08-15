import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import conversation from '../assets/dialog/superthrow.dialog.json';
import { Conversation } from './Conversation';
import { entity } from './Entity';
import { GameScene } from './scenes/GameScene';
import { NPC } from './NPC';
import { Point, Size } from './Geometry';
import { RenderingLayer } from './Renderer';

@entity("superthrow")
export class SuperThrow extends NPC {
    @asset("sprites/superthrow.aseprite.json")
    private static sprite: Aseprite;
    private floatAmount = 4;
    private floatSpeed = 2;

    public constructor(scene: GameScene, position: Point) {
        super(scene, position, new Size(18, 22));
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
        this.scene.renderer.addAseprite(SuperThrow.sprite, "idle", new Point(this.position.x, this.position.y - floatOffsetY), RenderingLayer.ENTITIES, this.direction);
        if (this.scene.showBounds) this.drawBounds();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.position);
    }
}
