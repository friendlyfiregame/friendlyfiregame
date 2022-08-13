import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import { entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import { NPC } from "./NPC";

const convo = {
    entry: [
        "This barrier almost seems like it's alive.",
        "The pulsating nature of the fluid-like structure is almost hypnotizing",
        "►Step away !end @entry",
        "►Touch the darkness !end !touchDarkness",
    ]
};

@entity("shadowgate")
export class ShadowGate extends NPC {
    @asset("sprites/shadowgate.aseprite.json")
    private static sprite: Aseprite;
    private animationTag = "idle";

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 64, 64);
        this.direction = 1;
        this.animator.assignSprite(ShadowGate.sprite);
        this.lookAtPlayer = false;
        this.conversation = new Conversation(convo, this);
    }

    public getInteractionText(): string {
        return "Examine Barrier";
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.animator.addOffset(0, 0).play(this.animationTag, this.direction);
        this.speechBubble.draw(ctx);
        if (this.scene.showBounds) {
            this.drawBounds();
        }
    }

    public update(dt: number): void {
        super.update(dt);
    }
}
