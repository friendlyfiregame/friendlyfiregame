import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { CollidableGameObject, GameScene } from './scenes/GameScene';
import { entity } from './Entity';
import { Environment } from './World';
import { GameObjectProperties } from './MapInfo';
import { PhysicsEntity } from './PhysicsEntity';
import { PIXEL_PER_METER } from './constants';
import { Point, Size } from './Geometry';
import { RenderingLayer } from './Renderer';

@entity("movingplatform")
export class MovingPlatform extends PhysicsEntity implements CollidableGameObject {
    @asset("sprites/stoneplatform.aseprite.json")
    private static sprite: Aseprite;

    private startX: number;
    private startY: number;
    private targetX: number;
    private targetY: number;
    private velocity: number;

    public constructor(scene: GameScene, position: Point, properties: GameObjectProperties) {
        super(scene, position, new Size(68, 12));
        this.setFloating(true);
        this.startX = this.targetX = position.x;
        this.startY = this.targetY = position.y;
        this.velocity = properties.velocity / PIXEL_PER_METER;
        if (properties.direction === "right") {
            this.targetX = position.x + properties.distance;
            this.setVelocityX(this.velocity);
        } else if (properties.direction === "left") {
            this.targetX = position.x - properties.distance;
            this.setVelocityX(-this.velocity);
        } else if (properties.direction === "up") {
            this.targetY = position.y + properties.distance;
            this.setVelocityY(this.velocity);
        } else if (properties.direction === "down") {
            this.targetY = position.y - properties.distance;
            this.setVelocityY(-this.velocity);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(MovingPlatform.sprite, "idle", this.position, RenderingLayer.PLATFORMS);
        if (this.scene.showBounds) this.drawBounds();
    }

    update(dt: number): void {
        super.update(dt);
        if (this.getVelocityY() > 0) {
            if (this.position.y >= Math.max(this.startY, this.targetY)) {
                this.position.moveYTo(Math.max(this.startY, this.targetY));
                this.setVelocityY(-this.velocity);
            }
        } else if (this.getVelocityY() < 0) {
            if (this.position.y <= Math.min(this.startY, this.targetY)) {
                this.position.moveYTo(Math.min(this.startY, this.targetY));
                this.setVelocityY(this.velocity);
            }
        }
        if (this.getVelocityX() > 0) {
            if (this.position.x >= Math.max(this.targetX, this.startX)) {
                this.position.moveXTo(Math.max(this.targetX, this.startX));
                this.setVelocityX(-this.velocity);
            }
        } else if (this.getVelocityX() < 0) {
            if (this.position.x <= Math.min(this.startX, this.targetX)) {
                this.position.moveXTo(Math.min(this.startX, this.targetX));
                this.setVelocityX(this.velocity);
            }
        }
    }

    collidesWith(x: number, y: number): number {
        if (x >= this.position.x - this.size.width / 2 && x <= this.position.x + this.size.width / 2
                && y >= this.position.y && y <= this.position.y + this.size.height) {
            return Environment.PLATFORM;
        }

        return Environment.AIR;
    }
}
