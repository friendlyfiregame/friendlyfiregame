import { now } from "./util";

export class Sprites {
    private readonly spriteWidth: number;
    private readonly spriteHeight: number;

    public constructor(
        private readonly image: HTMLImageElement,
        private readonly columns: number,
        private readonly rows: number
    ) {
        this.spriteWidth = image.width / columns;
        this.spriteHeight = image.height / rows;
    }

    public getSpriteWidth(): number {
        return this.image.width / this.columns - this.columns;
    }

    public getSpriteHeight(): number {
        return this.image.height / this.rows - this.rows;
    }

    public getColumns(): number {
        return this.columns;
    }

    public getRows(): number {
        return this.rows;
    }

    public getAspectRatio(): number {
        return this.getSpriteWidth() / this.getSpriteHeight();
    }

    public draw(ctx: CanvasRenderingContext2D, index: number, scale: number = 1): void {
        const column = index % this.columns;
        const row = Math.floor(index / this.columns);
        const sourceWidth = this.spriteWidth;
        const sourceHeight = this.spriteHeight;
        const sourceLeft = column * sourceWidth;
        const sourceTop = row * sourceHeight;
        ctx.drawImage(this.image, sourceLeft, sourceTop, sourceWidth, sourceHeight,
            -sourceWidth / 2 * scale, -sourceHeight * scale, sourceWidth * scale, sourceHeight * scale);
    }
}

export function getSpriteIndex(startIndex: number, delays: number[]): number {
    const duration = delays.reduce((duration, delay) => duration + delay, 0);
    let time = now() % duration;
    return startIndex + delays.findIndex(value => (time -= value) <= 0);
}
