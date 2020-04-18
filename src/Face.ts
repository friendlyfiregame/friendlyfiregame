import { NPC } from './NPC';
import { Sprites } from './Sprites';
import { loadImage } from './graphics';

export enum FaceModes {
    NEUTRAL = 0,
    WORRIED = 1,
    BORED = 2,
    AMUSED = 3
};

export class Face {
    private static sprites: Sprites;
    private mode = FaceModes.NEUTRAL;
    private direction = 1; // 1 = right, -1 = left

    constructor(
        private owner: NPC,
        private scale = 1,
        private offX = 0,
        private offY = 20
    ) {}

    public static async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/eyes.png"), 4, 1);
    }

    public setMode(mode: FaceModes) {
        this.mode = mode;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.owner.x + this.offX, -this.owner.y - this.offY);
        ctx.scale(this.direction, 1);
        Face.sprites.draw(ctx, this.mode, this.scale);
        ctx.restore();
    }

    public toggleDirection(direction = this.direction > 0 ? -1 : 1) {
        this.direction = direction;
    }

}
