import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import conversation from '../assets/dialog/chicken.dialog.json';
import { Conversation } from './Conversation';
import { entity } from './Entity';
import { GameScene } from './scenes/GameScene';
import { NPC } from './NPC';
import { Point, Size } from './Geometry';
import { RenderingLayer } from './Renderer';

@entity("chicken")
export class Chicken extends NPC {
    @asset("sprites/chicken.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, position: Point) {
        super(scene, position, new Size(24, 18));
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
        this.scene.renderer.addAseprite(Chicken.sprite, "idle", this.position, RenderingLayer.ENTITIES, this.direction);
        if (this.scene.showBounds) this.drawBounds();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.position);
    }
}
