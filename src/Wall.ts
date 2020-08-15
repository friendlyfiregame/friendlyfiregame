import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { CollidableGameObject, GameScene } from './scenes/GameScene';
import { Environment } from './World';
import { entity, Entity } from './Entity';
import { GameObjectProperties } from './MapInfo';
import { Point, Size } from './Geometry';
import { RenderingLayer } from './Renderer';

enum WallState { SOLID, CRUMBLED }

@entity("wall")
export class Wall extends Entity implements CollidableGameObject {
    @asset("sprites/wall.aseprite.json")
    private static sprite: Aseprite;
    public readonly identifier: string;
    private state = WallState.SOLID

    public constructor(scene: GameScene, position: Point, properties: GameObjectProperties) {
        super(scene, position, new Size(24, 72), false);
        if (!properties.identifier) throw new Error ('Cannot create Wall entity with no identifier property');
        this.identifier = properties.identifier;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const animationTag = this.state === WallState.SOLID ? 'solid' : 'crumbled'
        this.scene.renderer.addAseprite(Wall.sprite, animationTag, this.position, RenderingLayer.ENTITIES);
        if (this.scene.showBounds) this.drawBounds();
    }

    update(dt: number): void {}

    public crumble (): void {
        this.state = WallState.CRUMBLED
    }

    collidesWith(position: Point): number {
        if (
            this.state === WallState.SOLID
            && position.x >= this.position.x - this.size.width / 2
            && position.x <= this.position.x + this.size.width / 2
            && position.y >= this.position.y
            && position.y <= this.position.y + this.size.height
        ) {
            return Environment.SOLID;
        }

        return Environment.AIR;
    }
}
