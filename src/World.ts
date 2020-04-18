import { loadImage, getImageData } from "./graphics";
import { GameObject, Game } from "./game";

export class World implements GameObject {
    private foreground!: HTMLImageElement;
    private collisionMap!: Uint32Array;
    private visibleHeight!: number;
    private game: Game;

    public constructor(game: Game) {
        this.game = game;
    }

    public async load(): Promise<void> {
        const worldImage = await loadImage("world.png")
        const worldCollisionImage = await loadImage("world-collision-map.png");
        if (worldImage.width !== worldCollisionImage.width || worldImage.height !== worldCollisionImage.height) {
            throw new Error("World image must have same size as world collision image");
        }
        this.foreground = worldImage;
        this.collisionMap = new Uint32Array(getImageData(worldCollisionImage).data.buffer);
        this.visibleHeight = worldImage.height;
    }

    public getVisibleHeight(): number {
        return this.visibleHeight;
    }

    public setVisibleHeight(visibleHeight: number): void {
        this.visibleHeight = visibleHeight;
    }

    public getWidth(): number {
        return this.foreground.width;
    }

    public getHeight(): number {
        return this.foreground.height;
    }

    public update(dt: number) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const playerX = this.game.player.x;
        ctx.save();
        ctx.drawImage(this.foreground, -playerX, -this.visibleHeight);
        ctx.restore();
    }

    /**
     * Checks if the given position collides with the world.
     *
     * @param x - X position within the world.
     * @param y - Y position within the world.
     * @return 0 if no collision. Anything else is a specific collision type (Actually an RGBA color which has
     *         specific meaning).
     */
    public collidesWith(x: number, y: number): number {
        const index = (this.getHeight() - Math.round(y)) * this.getWidth() + Math.round(x);
        if (index < 0 || index >= this.collisionMap.length) {
            return 0;
        }
        return this.collisionMap[index];
    }
}
