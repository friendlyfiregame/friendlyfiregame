import { loadImage, getImageData } from "./graphics";
import { GameObject, Game } from "./game";

export enum Environment {
    AIR = 0,
    SOLID = 0xff000000,
    PLATFORM = 0xff7f7f7f
}

export class World implements GameObject {
    private foreground!: HTMLImageElement;
    private background!: HTMLImageElement;
    private collisionMap!: Uint32Array;
    private game: Game;

    public constructor(game: Game) {
        this.game = game;
    }

    public async load(): Promise<void> {
        const worldImage = await loadImage("maps/debug.png");
        const worldCollisionImage = await loadImage("maps/debug_collision.png");
        if (worldImage.width !== worldCollisionImage.width || worldImage.height !== worldCollisionImage.height) {
            throw new Error("World image must have same size as world collision image");
        }
        this.foreground = worldImage;
        this.background = await loadImage("maps/bg.png");
        this.collisionMap = new Uint32Array(getImageData(worldCollisionImage).data.buffer);
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
        const bgX = this.getWidth() / this.background.width;
        const bgY = this.getHeight() / this.background.height;
        const camX = this.game.camera.x;
        const camY = this.game.camera.y;
        ctx.save();
        ctx.translate(camX, -camY);
        ctx.drawImage(this.background, -camX / bgX, (-this.getHeight() + camY) / bgY);
        ctx.drawImage(this.foreground, -camX, -this.getHeight() + camY);
        ctx.restore();
    }

    public getEnvironment(x: number, y: number): Environment {
        const index = (this.getHeight() - 1 - Math.round(y)) * this.getWidth() + Math.round(x);
        if (index < 0 || index >= this.collisionMap.length) {
            return Environment.AIR;
        }
        return this.collisionMap[index];
    }

    /**
     * Checks if the given position collides with the world.
     *
     * @param x - X position within the world.
     * @param y - Y position within the world.
     * @return 0 if no collision. Anything else is a specific collision type (Actually an RGBA color which has
     *         specific meaning which isn't defined yet).
     */
    public collidesWith(x: number, y: number, ignore?: Environment[]): number {
        const index = (this.getHeight() - 1 - Math.round(y)) * this.getWidth() + Math.round(x);
        if (index < 0 || index >= this.collisionMap.length) {
            return 0;
        }
        const environment = this.getEnvironment(x, y);
        if (ignore && ignore.includes(environment)) {
            return Environment.AIR;
        }
        return this.collisionMap[index];
    }

    /**
     * Check collision of a vertical line with the world.
     *
     * @param x      - X position within the world.
     * @param y      - Y start position of the line in the world.
     * @param height - The height of the line to check
     * @return 0 if no collision. Type of first collision along the line otherwise.
     */
    public collidesWithVerticalLine(x: number, y: number, height: number, ignore?: Environment[]): number {
        for (let i = 0; i < height; i++) {
            const collision = this.collidesWith(x, y - i, ignore);
            if (collision) {
                return collision;
            }
        }
        return 0;
    }

    /**
     * Returns the Y coordinate of the ground below the given world coordinate.
     *
     * @param x - X coordinate of current position.
     * @param y - Y coordinate of current position.
     * @return The Y coordinate of the ground below the given coordinate.
     */
    public getGround(x: number, y: number, ignore?: Environment[]): number {
        while (y > 0 && !this.collidesWith(x, y, ignore)) {
            y--;
        }
        return y;
    }
}
