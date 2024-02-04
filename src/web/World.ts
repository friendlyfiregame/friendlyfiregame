import { GAME_CANVAS_HEIGHT, GAME_CANVAS_WIDTH, PETTING_ENDING_CUTSCENE_DURATION, WINDOW_ENDING_CUTSCENE_DURATION } from "../shared/constants";
import { asset } from "./Assets";
import { CameraBounds } from "./entities/CameraBounds";
import { Gate } from "./entities/Gate";
import { Pointer } from "./entities/Pointer";
import { type Bounds, Entity } from "./Entity";
import { getImageData } from "./graphics";
import { type ParticleEmitter, Particles, valueCurves } from "./Particles";
import { RenderingLayer, RenderingType } from "./Renderer";
import { type GameObject, isCollidableGameObject } from "./scenes/GameObject";
import { type GameScene } from "./scenes/GameScene";
import { rnd, rndInt } from "./util";
import { isInstanceOf } from "./util/predicates";

export enum Environment {
    AIR = 0,
    SOLID = 0xff000000,
    PLATFORM = 0xff7f7f7f,
    BOUNCE = 0xffff0000,
    WATER = 0xff0000ff,
    SOIL = 0xffffff00,
    RAINCLOUD = 0xff00ff00
}

export const validEnvironments = Object.values(Environment);

export class World implements GameObject {
    @asset("maps/level.png")
    private static readonly foreground: HTMLImageElement;

    @asset("maps/level_collision.png", {
        map: (image: HTMLImageElement) => new Uint32Array(getImageData(image).data.buffer)
    })
    private static readonly collisionMap: Uint32Array;

    @asset([
        "maps/bg.png",
        "maps/bg2.png",
        "maps/bg3.png"
    ])
    private static readonly backgrounds: HTMLImageElement[];

    /** Background displayed in the debug zoom-out mode because parallax background cannot work there. */
    @asset("maps/bg-debug.png")
    private static readonly debugBackground: HTMLImageElement;

    private readonly scene: GameScene;

    @asset("images/raindrop.png")
    private static readonly raindrop: HTMLImageElement;
    private rainEmitter: ParticleEmitter | null = null;
    private raining = false;

    public constructor(scene: GameScene) {
        this.scene = scene;
    }

    public activate(): Promise<void> | void {
        const rainSpawnPosition = this.scene.findEntity(Pointer, "rain_spawn_position");

        if (!rainSpawnPosition) {
            throw new Error("Missing 'rain_spawn_position' point in map data to place rain emitter");
        }

        this.rainEmitter = this.scene.particles.createEmitter({
            position: {x: rainSpawnPosition.x, y: rainSpawnPosition.y},
            offset: () => ({x: rnd(-1, 1) * 26, y: -rnd(-1, 1) * 5}),
            velocity: () => ({ x: rnd(-1, 1) * 5, y: rnd(50, 80) }),
            color: () => World.raindrop,
            size: 4,
            gravity: {x: 0, y: 100},
            lifetime: () => 3,
            alpha: 0.6,
            alphaCurve: valueCurves.linear.invert()
        });
    }

    public getWidth(): number {
        return World.foreground.width;
    }

    public getHeight(): number {
        return World.foreground.height;
    }

    public update(): void {
        if (this.raining) {
            this.rainEmitter?.emit(rndInt(1, 4));
        }
    }

    public render(): void {
        const width = GAME_CANVAS_WIDTH;
        const height = GAME_CANVAS_HEIGHT;
        const camera = this.scene.camera;
        const camX = camera.x;
        const camY = camera.y;
        const posXMultiplier = 1 - (camX / this.getWidth() * 2);
        const posYMultiplier = 1 - (camY / this.getHeight() * 2);

        let alpha = 1;
        if (this.scene.pettingCutscene) {
            alpha = Math.max(0, 1 - (this.scene.pettingCutsceneTime / PETTING_ENDING_CUTSCENE_DURATION));
        }
        if (this.scene.windowCutscene) {
            alpha = Math.max(0, 1 - (this.scene.windowCutsceneTime / (WINDOW_ENDING_CUTSCENE_DURATION / 1.5 )));
        }

        this.scene.renderer.add({
            type: RenderingType.DRAW_IMAGE,
            layer: RenderingLayer.TILEMAP_MAP,
            translation: { x: camX, y: camY },
            position: { x: -camX, y: -camY },
            asset: World.foreground,
            alpha: alpha
        });

        if (camera.isZoomingOut()) {
            // In debug camera zoom-out stretch a special background image because the parallax background cannot work there
            const background = World.debugBackground;
            const bgX = this.getWidth() / background.width;
            const bgY = this.getHeight() / background.height;
            this.scene.renderer.add({
                type: RenderingType.DRAW_IMAGE,
                layer: RenderingLayer.TILEMAP_BACKGROUND,
                translation: { x: camX, y: camY },
                position: { x: -camX / bgX, y: -camY / bgY },
                scale: { x: bgX, y: bgY },
                asset: background
            });
        } else {
            for (const background of World.backgrounds) {
                const bgX = this.getWidth() / background.width;
                const bgY = this.getHeight() / background.height;

                this.scene.renderer.add({
                    type: RenderingType.DRAW_IMAGE,
                    layer: RenderingLayer.TILEMAP_BACKGROUND,
                    translation: { x: camX, y: camY },
                    position: {
                        x: (-camX / bgX) + (-posXMultiplier * (width / 2)),
                        y: (-camY / bgY) + (-posYMultiplier * (height / 2))
                    },
                    asset: background,
                    alpha: alpha
                });
            }
        }
    }

    public getEnvironment(x: number, y: number): Environment {
        const index = Math.round(y) * this.getWidth() + Math.round(x);

        if (index < 0 || index >= World.collisionMap.length) {
            return Environment.AIR;
        }

        return World.collisionMap[index];
    }

    /**
     * Checks if the given position collides with the world.
     *
     * @param x - X position within the world.
     * @param y - Y position within the world.
     * @return 0 if no collision. Anything else is a specific collision type (actually an RGBA color
     *         which has specific meaning which isn't defined yet).
     */
    public collidesWith(x: number, y: number, ignoreObjects: GameObject[] = [], ignore: Environment[] = []): number {
        for (const gameObject of this.scene.gameObjects) {
            if (
                gameObject !== this
                && !ignoreObjects.includes(gameObject)
                && isCollidableGameObject(gameObject)
            ) {
                const environment = gameObject.collidesWith(x, y);

                if (environment !== Environment.AIR && !ignore.includes(environment) ) {
                    return environment;
                }
            }
        }

        const index = Math.round(y) * this.getWidth() + Math.round(x);

        if (index < 0 || index >= World.collisionMap.length) {
            return 0;
        }

        const environment = this.getEnvironment(x, y);

        if (
            !validEnvironments.includes(environment)
            || (ignore != null && ignore.includes(environment))
        ) {
            return Environment.AIR;
        }

        return World.collisionMap[index];
    }

    /**
     * Checks if a specific entity (`sourceEntity`) collides with either of of the entities in the
     * gameObjects array of the GameScene and returns all entities that currently collide.
     * `Particles` are taken out of this check automatically.
     *
     * @param sourceEntity    - The entity to be checked against the other entities
     * @param margin          - Optional margin added to the bounding boxes of the entities to
     *                          extend collision radius
     * @param ignoreEntities  - Array of entities to be ignored with this check
     * @return                - An array containing all entities that collide with the source
     *                          entity.
     */
    public getEntityCollisions(sourceEntity: Entity, margin = 0, ignoreEntities: Entity[] = []): Entity[] {
        const collidesWith: Entity[] = [];

        for (const gameObject of this.scene.gameObjects) {
            if (
                gameObject !== sourceEntity
                && !(gameObject instanceof Particles)
                && gameObject instanceof Entity
                && gameObject.isTrigger
                && !ignoreEntities.includes(gameObject)
            ) {
                const colliding = this.boundingBoxesCollide(
                    sourceEntity.getBounds(margin), gameObject.getBounds(margin)
                );

                if (colliding && (gameObject.newGamePlus == null || gameObject.newGamePlus === this.scene.game.campaign.isNewGamePlus)) {
                    collidesWith.push(gameObject);
                }
            }
        }

        return collidesWith;
    }

    private entityIsAvailableInNewGameState(newGamePlusProp: boolean | null = null): boolean {
        return (
            newGamePlusProp == null ||
            (
                newGamePlusProp === false && !this.scene.game.campaign.isNewGamePlus ||
                newGamePlusProp === true && this.scene.game.campaign.isNewGamePlus
            )
        );
    }

    public getGateCollisions(sourceEntity: Entity): Gate[] {
        const collidesWith: Gate[] = [];


        for (const gate of this.scene.gameObjects.filter(isInstanceOf(Gate))) {
            const colliding = this.boundingBoxesCollide(
                sourceEntity.getBounds(), gate.getBounds()
            );

            if (colliding && gate.disabled !== true && this.entityIsAvailableInNewGameState(gate.newGamePlus)) {
                collidesWith.push(gate);
            }
        }

        return collidesWith;
    }

    public getCameraBounds(sourceEntity: Entity): CameraBounds[] {
        const collidesWith: CameraBounds[] = [];

        for (const cameraBounds of this.scene.gameObjects.filter(isInstanceOf(CameraBounds))) {
            const colliding = this.boundingBoxesCollide(
                sourceEntity.getBounds(), cameraBounds.getBounds()
            );

            if (colliding) {
                collidesWith.push(cameraBounds);
            }
        }

        return collidesWith;
    }

    /**
     * Checks if the two provided bounding boxes are touching each other
     * @param box1 first bounding box
     * @param box2 second bounding box
     * @return `true` when the bounding boxes are touching, `false` if not.
     */
    public boundingBoxesCollide(box1: Bounds, box2: Bounds): boolean {
        return !(
            ((box1.y + box1.height) < box2.y) ||
            (box1.y > (box2.y + box2.height)) ||
            ((box1.x + box1.width) < box2.x) ||
            (box1.x > (box2.x + box2.width))
        );
    }

    public getObjectAt(
        x: number, y: number, ignoreObjects: GameObject[] = [], ignore: Environment[] = []
    ): GameObject | null {
        for (const gameObject of this.scene.gameObjects) {
            if (
                gameObject !== this
                && !ignoreObjects.includes(gameObject)
                && isCollidableGameObject(gameObject)
            ) {
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
    public collidesWithVerticalLine(
        x: number, y: number, height: number, ignoreObjects?: GameObject[], ignore?: Environment[]
    ): number {
        for (let i = 0; i < height; i++) {
            const collision = this.collidesWith(
                x, y + i, ignoreObjects, ignore
            );

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
    public getGround(
        x: number, y: number, ignoreObjects?: GameObject[], ignore?: Environment[]
    ): number {
        while (
            y < this.getHeight() && !this.collidesWith(x, y, ignoreObjects, ignore)
        ) {
            y++;
        }

        return y;
    }

    public startRain(): void {
        this.raining = true;
    }

    public stopRain(): void {
        this.raining = false;
    }

    public isRaining(): boolean {
        return this.raining;
    }
}
