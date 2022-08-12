import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import { NPC } from "./NPC";

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
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.animator.addOffset(0, 0).play(this.animationTag, this.direction);

        if (this.scene.showBounds) {
            this.drawBounds();
        }
    }

    public update(dt: number): void {
        super.update(dt);
    }
}
