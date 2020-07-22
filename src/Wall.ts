import { entity, Entity } from "./Entity";
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";
import { GameScene, CollidableGameObject } from "./scenes/GameScene";
import { Environment } from './World';
import { GameObjectProperties } from './MapInfo';

enum WallState { SOLID, CRUMBLED }

@entity("wall")
export class Wall extends Entity implements CollidableGameObject {
    @asset("sprites/wall.aseprite.json")
    private static sprite: Aseprite;
    public readonly identifier: string;
    private state = WallState.SOLID

    public constructor(scene: GameScene, x: number, y:number, properties: GameObjectProperties) {
        super(scene, x, y, 24, 72, false);
        if (!properties.identifier) throw new Error ('Cannot create Wall entity with no identifier property');
        this.identifier = properties.identifier;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);

        const animationTag = this.state === WallState.SOLID ? 'solid' : 'crumbled'

        Wall.sprite.drawTag(ctx, animationTag, -Wall.sprite.width >> 1, -Wall.sprite.height,
            this.scene.gameTime * 1000);
        ctx.restore();
        if (this.scene.showBounds) this.drawBounds(ctx);
    }

    update(dt: number): void {}

    public crumble (): void {
        this.state = WallState.CRUMBLED
    }

    collidesWith(x: number, y: number): number {
        if (this.state === WallState.SOLID && x >= this.x - this.width / 2 && x <= this.x + this.width / 2
                && y >= this.y && y <= this.y + this.height) {
            return Environment.SOLID;
        }
        return Environment.AIR;
    }
}
