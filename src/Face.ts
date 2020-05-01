import { NPC } from './NPC';
import { Aseprite } from "./Aseprite";

export enum FaceModes {
    BLINK = "blink",
    NEUTRAL = "neutral",
    ANGRY = "angry",
    BORED = "bored",
    AMUSED = "amused",
    SAD = "sad"
};

export enum EyeType {
    STANDARD = "standard",
    TREE = "tree",
    STONE = "stone",
    FLAMEBOY = "flameboy"
}

export class Face {
    private sprite!: Aseprite;
    private mode = FaceModes.NEUTRAL;
    private direction = 1; // 1 = right, -1 = left

    constructor(
        private owner: NPC,
        private eyeType: EyeType,
        private offX = 0,
        private offY = 20
    ) {}

    public async load(): Promise<void> {
        this.sprite = await Aseprite.load(`assets/sprites/eyes/${this.eyeType}.aseprite.json`);
    }

    public setMode(mode: FaceModes) {
        this.mode = mode;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.owner.x + this.offX, -this.owner.y - this.offY);
        ctx.scale(this.direction, 1);
        const isBlinking = ((<any>window).game?.gameTime % 5) < 0.6;
        const frame = isBlinking ? FaceModes.BLINK : this.mode;
        this.sprite.drawTag(ctx, frame, -this.sprite.width >> 1, -this.sprite.height);
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
