import { loadImage, getImageData } from "./graphics";
import { GameObject, Game, isCollidableGameObject, gameWidth } from "./game";
import { ParticleEmitter, particles, valueCurves } from "./Particles";
import { rnd, rndInt } from "./util";

export enum Environment {
    AIR = 0,
    SOLID = 0xff000000,
    PLATFORM = 0xff7f7f7f,
    BOUNCE = 0xffff0000,
    WATER = 0xff0000ff,
    SOIL = 0xffffff00,
    RAINCLOUD = 0xff00ff00
}

export class World implements GameObject {
    private foreground!: HTMLImageElement;
    private background!: HTMLImageElement;
    private background2!: HTMLImageElement;
    private background3!: HTMLImageElement;
    private collisionMap!: Uint32Array;
    private game: Game;
    private raindrop!: HTMLImageElement;
    private rainEmitter: ParticleEmitter;
    private raining = false;

    public constructor(game: Game) {
        this.game = game;
        this.rainEmitter = particles.createEmitter({
            position: {x: 2051, y: 2120},
            offset: () => ({x: rnd(-1, 1) * 26, y: rnd(-1, 1) * 5}),
            velocity: () => ({ x: rnd(-1, 1) * 5, y: -rnd(50, 80) }),
            color: () => this.raindrop,
            size: 4,
            gravity: {x: 0, y: -100},
            lifetime: () => 3,
            alpha: 0.6,
            alphaCurve: valueCurves.linear.invert()
        });
    }

    public async load(): Promise<void> {
        const worldImage = await loadImage("maps/level.png");
        const worldCollisionImage = await loadImage("maps/level_collision.png");
        if (worldImage.width !== worldCollisionImage.width || worldImage.height !== worldCollisionImage.height) {
            throw new Error("World image must have same size as world collision image");
        }
        this.foreground = worldImage;
        this.background = await loadImage("maps/bg.png");
        this.background2 = await loadImage("maps/bg2.png");
        this.background3 = await loadImage("maps/bg3.png");
        this.collisionMap = new Uint32Array(getImageData(worldCollisionImage).data.buffer);
        this.raindrop = await loadImage("sprites/raindrop.png");
    }

    public getWidth(): number {
        return this.foreground.width;
    }

    public getHeight(): number {
        return this.foreground.height;
    }

    public update(dt: number) {
        if (this.raining) {
            this.rainEmitter.emit(rndInt(1, 4));
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const bgX = this.getWidth() / this.background.width;
        const bgY = this.getHeight() / this.background.height;

        const bg2X = this.getWidth() / this.background2.width;
        const bg2Y = this.getHeight() / this.background2.height;

        const bg3X = this.getWidth() / this.background3.width;
        const bg3Y = this.getHeight() / this.background3.height;

        const camX = this.game.camera.x;
        const camY = this.game.camera.y;
        const posXMultiplier = 1 - (camX / this.getWidth() * 2);
        ctx.save();
        ctx.translate(camX, -camY);
        ctx.drawImage(this.background, (-camX / bgX) + (-posXMultiplier * (gameWidth / 2)), (-this.getHeight() + camY) / bgY);
        ctx.drawImage(this.background2, (-camX / bg2X) + (-posXMultiplier * (gameWidth / 2)), (-this.getHeight() + camY) / bg2Y);
        ctx.drawImage(this.background3, (-camX / bg3X) + (-posXMultiplier * (gameWidth / 2)), (-this.getHeight() + camY) / bg3Y);
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
    public collidesWith(x: number, y: number, ignoreObjects: GameObject[] = [], ignore: Environment[] = []): number {
        for (const gameObject of this.game.gameObjects) {
            if (gameObject !== this && !ignoreObjects.includes(gameObject) && isCollidableGameObject(gameObject)) {
                const environment = gameObject.collidesWith(x, y);
                if (environment !== Environment.AIR && !ignore.includes(environment) ) {
                    return environment;
                }
            }
        }

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

    public getObjectAt(x: number, y: number, ignoreObjects: GameObject[] = [], ignore: Environment[] = []):
            GameObject | null {
        for (const gameObject of this.game.gameObjects) {
            if (gameObject !== this && !ignoreObjects.includes(gameObject) && isCollidableGameObject(gameObject)) {
                const environment = gameObject.collidesWith(x, y);
                if (environment !== Environment.AIR && !ignore.includes(environment)) {
                    return gameObject;
                }
            }
        }
        return null;
    }

    /**
     * Check collision of a vertical line with the world.
     *
     * @param x      - X position within the world.
     * @param y      - Y start position of the line in the world.
     * @param height - The height of the line to check
     * @return 0 if no collision. Type of first collision along the line otherwise.
     */
    public collidesWithVerticalLine(x: number, y: number, height: number, ignoreObjects?: GameObject[],
            ignore?: Environment[]): number {
        for (let i = 0; i < height; i++) {
            const collision = this.collidesWith(x, y - i, ignoreObjects, ignore);
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
    public getGround(x: number, y: number, ignoreObjects?: GameObject[], ignore?: Environment[]): number {
        while (y > 0 && !this.collidesWith(x, y, ignoreObjects, ignore)) {
            y--;
        }
        return y;
    }

    public startRain() {
        this.raining = true;
    }

    public stopRain() {
        this.raining = false;
    }

    public isRaining() {
        return this.raining;
    }
}
