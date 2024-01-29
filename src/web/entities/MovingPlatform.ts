import { PIXEL_PER_METER } from "../../shared/constants";
import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity, type EntityArgs } from "../Entity";
import { RenderingLayer } from "../Renderer";
import { type CollidableGameObject } from "../scenes/GameObject";
import { Environment } from "../World";
import { PhysicsEntity } from "./PhysicsEntity";

/** Platform movement direction. */
export type CloudDirection = "up" | "down" | "right" | "left";

/** Moving platform entity constructor arguments */
export interface MovingEntityArgs extends EntityArgs {
    /** Initial movement direction of the platform. Defaults to "up". */
    direction?: CloudDirection;

    /** Platform movement velocity. Defaults to 0. */
    velocity?: number;

    /** How far the platform moves before it changes movement into opposite direction. Defaults to 0. */
    distance?: number;
}

@entity("movingplatform")
export class MovingPlatform extends PhysicsEntity implements CollidableGameObject {
    @asset("sprites/stoneplatform.aseprite.json")
    private static readonly sprite: Aseprite;

    private readonly startX: number;
    private readonly startY: number;
    private readonly targetX: number;
    private readonly targetY: number;
    private readonly velocity: number;

    public constructor({ direction = "up",  velocity = 0, distance = 0, ...args }: MovingEntityArgs) {
        super({ ...args, width: 68, height: 12 });
        this.setFloating(true);
        const { x, y } = this;
        this.startX = this.targetX = x;
        this.startY = this.targetY = y;
        this.velocity = velocity / PIXEL_PER_METER;
        if (direction === "right") {
            this.targetX = x + distance;
            this.setVelocityX(this.velocity);
        } else if (direction === "left") {
            this.targetX = x - distance;
            this.setVelocityX(-this.velocity);
        } else if (direction === "up") {
            this.targetY = y + distance;
            this.setVelocityY(this.velocity);
        } else if (direction === "down") {
            this.targetY = y - distance;
            this.setVelocityY(-this.velocity);
        }
    }

    public override draw(): void {
        this.scene.renderer.addAseprite(MovingPlatform.sprite, "idle", this.x, this.y, RenderingLayer.PLATFORMS);
    }

    public override update(dt: number): void {
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
