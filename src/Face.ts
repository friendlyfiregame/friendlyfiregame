import { NPC } from './NPC';
import { Sprites } from './Sprites';
import { loadImage } from './graphics';

export enum FaceModes {
    NEUTRAL = 1,
    ANGRY = 2,
    BORED = 3,
    AMUSED = 4,
    SAD = 5
};

export enum EyeType {
    STANDARD = 0,
    TREE = 1,
    STONE = 2
}

export class Face {
    private static sprites: Sprites;
    private mode = FaceModes.NEUTRAL;
    private direction = 1; // 1 = right, -1 = left

    constructor(
        private owner: NPC,
        private eyeType: EyeType,
        private scale = 1,
        private offX = 0,
        private offY = 20
    ) {}

    public static async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage(`sprites/eyes.png`), 6, 3);
    }

    public setMode(mode: FaceModes) {
        this.mode = mode;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.owner.x + this.offX, -this.owner.y - this.offY);
        ctx.scale(this.direction, 1);
        const isBlinking = ((<any>window).game?.gameTime % 5) < 0.6;
        const frame = isBlinking ? 0 : this.mode;
        Face.sprites.draw(ctx, frame + (Face.sprites.getColumns() * this.eyeType), this.scale);
        ctx.restore();
    }

    public toggleDirection(direction = this.direction > 0 ? -1 : 1) {
        if (direction !== this.direction) {
            this.direction = direction;
        }
    }

}
