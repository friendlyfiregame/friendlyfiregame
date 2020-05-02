import { NPC } from './NPC';
import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";

export enum FaceModes {
    BLINK = "blink",
    NEUTRAL = "neutral",
    ANGRY = "angry",
    BORED = "bored",
    AMUSED = "amused",
    SAD = "sad"
};

export enum EyeType {
    STANDARD = 0,
    TREE = 1,
    STONE = 2,
    FLAMEBOY = 3
}

export class Face {
    @asset([
        "sprites/eyes/standard.aseprite.json",
        "sprites/eyes/tree.aseprite.json",
        "sprites/eyes/stone.aseprite.json",
        "sprites/eyes/flameboy.aseprite.json",
    ])
    private static sprites: Aseprite[];

    private mode = FaceModes.NEUTRAL;
    private direction = 1; // 1 = right, -1 = left

    constructor(
        private scene: GameScene,
        private owner: NPC,
        private eyeType: EyeType,
        private offX = 0,
        private offY = 20
    ) {}

    public setMode(mode: FaceModes) {
        this.mode = mode;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.owner.x + this.offX, -this.owner.y - this.offY);
        ctx.scale(this.direction, 1);
        const isBlinking = ((<any>window).game?.gameTime % 5) < 0.6;
        const frame = isBlinking ? FaceModes.BLINK : this.mode;
        const sprite = Face.sprites[this.eyeType];
        sprite.drawTag(ctx, frame, -sprite.width >> 1, -sprite.height, this.scene.gameTime * 1000);
        ctx.restore();
    }

    public toggleDirection(direction = this.direction > 0 ? -1 : 1) {
        if (direction !== this.direction) {
            this.direction = direction;
        }
    }
    public setDirection(direction: number) {
        this.direction = direction;
    }
}
