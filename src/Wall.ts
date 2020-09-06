import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { CollidableGameObject, GameScene } from "./scenes/GameScene";
import { entity, Entity } from "./Entity";
import { Environment } from "./World";
import { GameObjectProperties } from "./MapInfo";
import { RenderingLayer } from "./Renderer";

enum WallState { SOLID, CRUMBLED }

@entity("wall")
export class Wall extends Entity implements CollidableGameObject {
    @asset("sprites/wall.aseprite.json")
    private static sprite: Aseprite;
    public readonly identifier: string;
    private state = WallState.SOLID;

    public constructor(scene: GameScene, x: number, y: number, properties: GameObjectProperties) {
        super(scene, x, y, 24, 72, false);
        this.setLayer(RenderingLayer.ENTITIES);

        if (!properties.identifier) {
            throw new Error ("Cannot create Wall entity with no identifier property");
        }

        this.identifier = properties.identifier;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const animationTag = this.state === WallState.SOLID ? "solid" : "crumbled";
        Wall.sprite.drawTag(ctx, animationTag, -Wall.sprite.width >> 1, -Wall.sprite.height);
    }

    public update(): void {}

    public crumble(): void {
        this.state = WallState.CRUMBLED;
    }

    collidesWith(x: number, y: number): number {
        if (
            this.state === WallState.SOLID
            && x >= this.x - this.width / 2
            && x <= this.x + this.width / 2
            && y >= this.y
            && y <= this.y + this.height
        ) {
            return Environment.SOLID;
        }

        return Environment.AIR;
    }
}
