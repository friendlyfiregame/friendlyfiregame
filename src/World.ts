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
        const worldImage = await loadImage("maps/world.png")
        const worldCollisionImage = await loadImage("maps/world_collision.png");
        if (worldImage.width !== worldCollisionImage.width || worldImage.height !== worldCollisionImage.height) {
            throw new Error("World image must have same size as world collision image");
        }
        this.foreground = worldImage;
        this.collisionMap = new Uint32Array(getImageData(worldCollisionImage).data.buffer);
        this.visibleHeight = 256;
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
        const playerY = this.game.player.y;
        ctx.save();
        ctx.drawImage(this.foreground, -playerX, -this.getHeight() + playerY);
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
        const index = (this.getHeight() - 1 - Math.round(y)) * this.getWidth() + Math.round(x);
        if (index < 0 || index >= this.collisionMap.length) {
            return 0;
        }
        return this.collisionMap[index];
    }

    private collidesWithVerticalLine(x: number, y: number, height: number): number {
        for (let i = 0; i < height; i++) {
            const collision = this.collidesWith(x, y - i);
            if (collision) {
                return collision;
            }
        }
        return 0;
    }

    public getTop(x: number, y: number): number {
        while (this.collidesWith(x, y)) {
            y++;
        }
        return y;
    }

    public getBottom(x: number, y: number): number {
        while (this.collidesWith(x, y)) {
            y--;
        }
        return y;
    }

    public getLeft(x: number, y: number, height: number): number {
        while (this.collidesWithVerticalLine(x, y, height)) {
            x--;
        }
        return x;
    }

    public getRight(x: number, y: number, height: number): number {
        while (this.collidesWithVerticalLine(x, y, height)) {
            x++;
        }
        return x;
    }
}
