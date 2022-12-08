import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity } from "../Entity";
import { LevelId } from "../Levels";
import { GameScene } from "../scenes/GameScene";
import { NPC } from "./NPC";

@entity("videogame")
export class Videogame extends NPC {
    @asset("sprites/videogame.aseprite.json")
    private static sprite: Aseprite;
    private animationTag = "idle";

    public constructor(scene: GameScene, x: number, y: number, levelId: LevelId) {
        super(scene, x, y, 30, 18, levelId);
        this.direction = 1;
        this.animator.assignSprite(Videogame.sprite);
        this.lookAtPlayer = false;
        this.setFloating(true);
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
