import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import conversation from "../../assets/dialog/chicken.dialog.json";
import { entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import { NPC } from "./NPC";
import { RenderingLayer } from "../Renderer";
import { LevelId } from "../Levels";

@entity("chicken")
export class Chicken extends NPC {
    @asset("sprites/chicken.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y: number, levelId: LevelId) {
        super(scene, x, y, 24, 18, levelId);

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
        this.scene.renderer.addAseprite(
            Chicken.sprite,
            "idle",
            this.x, this.y,
            RenderingLayer.ENTITIES,
            this.direction
        );

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        this.speechBubble.draw(ctx);
    }

    public update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
    }
}
