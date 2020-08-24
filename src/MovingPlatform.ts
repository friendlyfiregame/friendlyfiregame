import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { CollidableGameObject, GameScene } from './scenes/GameScene';
import { Direction } from './geometry/Direction';
import { entity } from './Entity';
import { Environment } from './World';
import { GameObjectProperties } from './MapInfo';
import { PhysicsEntity } from './PhysicsEntity';
import { PIXEL_PER_METER } from './constants';
import { Point } from './geometry/Point';
import { RenderingLayer } from './Renderer';
import { Size } from './geometry/Size';

@entity("movingplatform")
export class MovingPlatform extends PhysicsEntity implements CollidableGameObject {
    @asset("sprites/stoneplatform.aseprite.json")
    private static sprite: Aseprite;

    private startPosition: Point;
    private targetPosition: Point;
    private velocity: number;

    public constructor(scene: GameScene, position: Point, properties: GameObjectProperties) {
        super(scene, position, new Size(68, 12));
        this.setFloating(true);
        this.startPosition = position.clone();
        this.targetPosition = position.clone();
        this.velocity = properties.velocity / PIXEL_PER_METER;

        if (properties.direction === Direction.RIGHT) {
            this.targetPosition.moveXBy(properties.distance);
            this.setVelocityX(this.velocity);
        } else if (properties.direction === Direction.LEFT) {
            this.targetPosition.moveXBy(-properties.distance);
            this.setVelocityX(-this.velocity);
        } else if (properties.direction === Direction.UP) {
            this.targetPosition.moveYBy(properties.distance);
            this.setVelocityY(this.velocity);
        } else if (properties.direction === Direction.DOWN) {
            this.targetPosition.moveYBy(-properties.distance);
            this.setVelocityY(-this.velocity);
        }
    }

    draw(): void {
        this.scene.renderer.addAseprite(MovingPlatform.sprite, "idle", this.position, RenderingLayer.PLATFORMS);
        if (this.scene.showBounds) this.drawBounds();
    }

    update(dt: number): void {
        super.update(dt);

        if (this.getVelocityY() > 0) {
            const yMax = Math.max(this.startPosition.y, this.targetPosition.y);

            if (this.position.y >= yMax) {
                this.position.moveYTo(yMax);
                this.setVelocityY(-this.velocity);
            }
        } else if (this.getVelocityY() < 0) {
            const yMin = Math.min(this.startPosition.y, this.targetPosition.y);

            if (this.position.y <= yMin) {
                this.position.moveYTo(yMin);
                this.setVelocityY(this.velocity);
            }
        }

        if (this.getVelocityX() > 0) {
            const xMax = Math.max(this.startPosition.x, this.targetPosition.x);

            if (this.position.x >= xMax) {
                this.position.moveXTo(xMax);
                this.setVelocityX(-this.velocity);
            }
        } else if (this.getVelocityX() < 0) {
            const xMin = Math.min(this.startPosition.x, this.targetPosition.x);

            if (this.position.x <= xMin) {
                this.position.moveXTo(xMin);
                this.setVelocityX(this.velocity);
            }
        }
    }

    collidesWith(position: Point): number {
        if (
            position.x >= this.position.x - this.size.width / 2
            && position.x <= this.position.x + this.size.width / 2
            && position.y >= this.position.y
            && position.y <= this.position.y + this.size.height
        ) {
            return Environment.PLATFORM;
        }

        return Environment.AIR;
    }
}
