import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity } from "../Entity";
import { GameObjectProperties } from "../MapInfo";
import { GameScene } from "../scenes/GameScene";
import { rndInt, rndItem } from "../util";
import { NPC } from "./NPC";

function easeInOut (t: number): number {
    return t * t * (3 - (2 * t));
}

@entity("shadowHand")
export class ShadowHand extends NPC {
    @asset("sprites/shadowhand.aseprite.json")
    private static sprite: Aseprite;
    private maxYMovement = rndInt(10, 20);
    private reactionRadius = rndInt(40, 120);
    private animationTag = rndItem(["idle1", "idle2"]);
    private faceUp = false;

    public constructor(scene: GameScene, x: number, y: number, properties: GameObjectProperties) {
        super(scene, x, y, 14, 26);
        this.direction = rndItem([1, -1]);
        this.animator.assignSprite(ShadowHand.sprite);
        this.lookAtPlayer = false;
        if (properties.direction === "up") this.faceUp = true;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // const scale = this.direction < 0 ? { x: -1, y: 1 } : undefined;
        let offsetY = 0;
        if (this.absoluteDistanceToPlayerX <= this.reactionRadius) {
            const progress = this.absoluteDistanceToPlayerX / this.reactionRadius;
            const val = easeInOut(progress);
            offsetY = (this.maxYMovement - (val * this.maxYMovement)) * (this.faceUp ? -1 : 1);
        }

        this.animator.addOffset(0, offsetY).play(this.animationTag, this.direction, undefined, this.faceUp);

        if (this.scene.showBounds) {
            this.drawBounds();
        }
    }

    public update(dt: number): void {
        super.update(dt);
    }
}
