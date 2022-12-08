import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { CollidableGameObject, GameScene } from "../scenes/GameScene";
import { entity } from "../Entity";
import { Environment } from "../World";
import { GameObjectProperties } from "../MapInfo";
import { PhysicsEntity } from "./PhysicsEntity";
import { PIXEL_PER_METER } from "../../shared/constants";
import { RenderingLayer } from "../Renderer";
import { LevelId } from "../Levels";

@entity("movingplatform")
export class MovingPlatform extends PhysicsEntity implements CollidableGameObject {
    @asset("sprites/stoneplatform.aseprite.json")
    private static sprite: Aseprite;

    private startX: number;
    private startY: number;
    private targetX: number;
    private targetY: number;
    private velocity: number;

    public constructor(scene: GameScene, x: number, y: number, levelId: LevelId, properties: GameObjectProperties) {
        super(scene, x, y, 68, 12, levelId);
        this.setFloating(true);
        this.startX = this.targetX = x;
        this.startY = this.targetY = y;
        this.velocity = properties.velocity / PIXEL_PER_METER;
        if (properties.direction === "right") {
            this.targetX = x + properties.distance;
            this.setVelocityX(this.velocity);
        } else if (properties.direction === "left") {
            this.targetX = x - properties.distance;
            this.setVelocityX(-this.velocity);
        } else if (properties.direction === "up") {
            this.targetY = y + properties.distance;
            this.setVelocityY(this.velocity);
        } else if (properties.direction === "down") {
            this.targetY = y - properties.distance;
            this.setVelocityY(-this.velocity);
        }
    }

    public draw(): void {
        this.scene.renderer.addAseprite(MovingPlatform.sprite, "idle", this.x, this.y, RenderingLayer.PLATFORMS);

        if (this.scene.showBounds) {
            this.drawBounds();
        }
    }

    public update(dt: number): void {
        super.update(dt);

        if (this.getVelocityY() > 0) {
            if (this.y >= Math.max(this.startY, this.targetY)) {
                this.y = Math.max(this.startY, this.targetY);
                this.setVelocityY(-this.velocity);
            }
        } else if (this.getVelocityY() < 0) {
            if (this.y <= Math.min(this.startY, this.targetY)) {
                this.y = Math.min(this.startY, this.targetY);
                this.setVelocityY(this.velocity);
            }
        }

        if (this.getVelocityX() > 0) {
            if (this.x >= Math.max(this.targetX, this.startX)) {
                this.x = Math.max(this.targetX, this.startX);
                this.setVelocityX(-this.velocity);
            }
        } else if (this.getVelocityX() < 0) {
            if (this.x <= Math.min(this.startX, this.targetX)) {
                this.x = Math.min(this.startX, this.targetX);
                this.setVelocityX(this.velocity);
            }
        }
    }

    public collidesWith(x: number, y: number): number {
        if (
            x >= this.x - this.width / 2
            && x <= this.x + this.width / 2
            && y >= this.y
            && y <= this.y + this.height
        ) {
            return Environment.PLATFORM;
        }

        return Environment.AIR;
    }
}
