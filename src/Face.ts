import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { RenderingLayer } from "./RenderingLayer";
import { SceneNode } from "./scene/SceneNode";

export enum FaceModes {
    BLINK = "blink",
    NEUTRAL = "neutral",
    ANGRY = "angry",
    BORED = "bored",
    AMUSED = "amused",
    SAD = "sad",
    DISGUSTED = "disgusted"
}

export enum EyeType {
    STANDARD = 0,
    TREE = 1,
    STONE = 2,
    FLAMEBOY = 3,
    STONEDISCIPLE = 4
}

export class Face extends SceneNode {
    @asset([
        "sprites/eyes/standard.aseprite.json",
        "sprites/eyes/tree.aseprite.json",
        "sprites/eyes/stone.aseprite.json",
        "sprites/eyes/flameboy.aseprite.json",
        "sprites/eyes/stonedisciple.aseprite.json",
    ])
    private static sprites: Aseprite[];

    private mode = FaceModes.NEUTRAL;
    private direction = 1; // 1 = right, -1 = left

    constructor(
        private gameScene: GameScene,
        private eyeType: EyeType,
        private lookAtPlayer: boolean,
        private offX = 0,
        private offY = 20
    ) {
        super({ layer: RenderingLayer.ENTITIES });
    }

    public setMode(mode: FaceModes): void {
        this.mode = mode;
    }

    public update() {
        // Look at player
        const parent = this.getParent();
        if (parent != null && this.lookAtPlayer) {
            const dx = this.gameScene.player.x - parent.x;
            this.toggleDirection((dx > 0) ? 1 : -1);
        } else {
            this.setDirection(this.direction);
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const sprite = Face.sprites[this.eyeType];
        ctx.scale(this.direction, 1);
        sprite.drawTag(ctx, this.mode, (-sprite.width >> 1) + this.offX, -sprite.height - this.offY);
        ctx.restore();
    }

    public toggleDirection(direction = this.direction > 0 ? -1 : 1): void {
        if (direction !== this.direction) {
            this.direction = direction;
        }
    }

    public setDirection(direction: number): void {
        this.direction = direction;
    }
}
