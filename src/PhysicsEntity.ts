import { DROWNING_VELOCITY, GRAVITY, PIXEL_PER_METER, TERMINAL_VELOCITY } from "./constants";
import { Entity } from "./Entity";
import { Environment } from "./World";
import { Player } from "./Player";
import { SceneNode } from "./scene/SceneNode";

export abstract class PhysicsEntity extends Entity {
    private velocityX = 0;
    private velocityY = 0;
    private maxVelocityX = Infinity;
    private maxVelocityY = Infinity;
    private floating = false;
    private ground: SceneNode | null = null;

    // This property describes how much the player hitbox grows when
    // this entity is carried. Defaults to the entities own height.
    public carryHeight = this.height;

    protected lastGroundPosition = { x: 0, y: 0 };

    public setFloating(floating: boolean): void {
        this.floating = floating;

        if (floating) {
            this.setVelocity(0, 0);
        }
    }

    public isFloating(): boolean {
        return this.floating;
    }

    public setMaxVelocity(maxVelocityX: number, maxVelocityY = maxVelocityX): void {
        this.maxVelocityX = maxVelocityX;
        this.maxVelocityY = maxVelocityY;
    }

    public accelerate(x: number, y: number): void {
        this.accelerateX(x);
        this.accelerateY(y);
    }

    public accelerateX(x: number): void {
        if (x > 0) {
            this.velocityX = Math.min(this.maxVelocityX, this.velocityX + x);
        } else {
            this.velocityX = Math.max(-this.maxVelocityX, this.velocityX + x);
        }
    }

    public accelerateY(y: number): void {
        this.velocityY = Math.min(this.maxVelocityY, this.velocityY + y);
    }

    public decelerate(x: number, y: number): void {
        this.decelerateX(x);
        this.decelerateY(y);
    }

    public decelerateX(x: number): void {
        if (x > 0) {
            this.velocityX = Math.max(0, this.velocityX - x);
        } else {
            this.velocityX = Math.min(0, this.velocityX - x);
        }
    }

    public decelerateY(y: number): void {
        this.velocityY = Math.max(0, this.velocityY - y);
    }

    public setVelocity(x: number, y: number): void {
        this.velocityX = x;
        this.velocityY = y;
    }

    public setVelocityX(x: number): void {
        this.velocityX = x;
    }

    public setVelocityY(y: number): void {
        this.velocityY = y;
    }

    public getVelocityX(): number {
        return this.velocityX;
    }

    public getVelocityY(): number {
        return this.velocityY;
    }

    private checkCollision(x: number, y: number, ignore?: Environment[]): Environment {
        return this.gameScene.world.collidesWith(x, y, [ this ], ignore);
    }

    private checkCollisionBox(x: number, y: number, ignore?: Environment[]): Environment {
        for (let i = -this.width / 2; i < this.width / 2; i++) {
            let env = this.checkCollision(x + i, y, ignore);

            if (env !== Environment.AIR) {
                return env;
            }

            env = this.checkCollision(x + i, y + this.height, ignore);

            if (env !== Environment.AIR) {
                return env;
            }
        }

        for (let i = 0; i < this.height; i++) {
            let env = this.checkCollision(x - this.width / 2, y + i, ignore);

            if (env !== Environment.AIR) {
                return env;
            }

            env = this.checkCollision(x + this.width / 2, y + i, ignore);

            if (env !== Environment.AIR) {
                return env;
            }
        }

        return Environment.AIR;
    }

    protected updatePosition(newX: number, newY: number): void {

        if (this.floating) {
            this.x = newX;
            this.y = newY;
        } else {
            const env = this.checkCollisionBox(
                newX, newY, newY > this.y ? [ Environment.PLATFORM ] : []
            );

            if (env === Environment.AIR || env === Environment.WATER) {
                this.x = newX;
                this.y = newY;
            } else {
                this.setVelocity(0, 0);
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Nothing to do here. Overwrite me.
    }

    public update(dt: number): void {
        super.update(dt);

        const world = this.gameScene.world;
        const ground = world.getObjectAt(this.x, this.y - 5, [ this ]);

        if (ground instanceof PhysicsEntity) {
            this.x += ground.getVelocityX() * PIXEL_PER_METER * dt;
            this.y += ground.getVelocityY() * PIXEL_PER_METER * dt;
        }

        this.ground = ground;

        this.updatePosition(
            this.x + this.velocityX * PIXEL_PER_METER * dt,
            this.y + this.velocityY * PIXEL_PER_METER * dt
        );

        // Object dropping down when there is no ground below
        if (!this.floating) {
            const environment = world.collidesWith(
                this.x, this.y - 1,
                [ this ],
                this instanceof Player && this.jumpDown ? [ Environment.PLATFORM ] : []
            );

            if (environment === Environment.AIR) {
                this.velocityY -= this.getGravity() * dt;

                // Apply terminal velocity to falling entities
                if (this.velocityY < 0) {
                    this.velocityY = Math.max(this.velocityY, TERMINAL_VELOCITY);
                }
            } else if (environment === Environment.WATER) {
                this.velocityY = DROWNING_VELOCITY;
                this.velocityX = 0;
            } else if (this.velocityY < 0) {
                this.velocityY = 0;

                if (!(this instanceof Player)) {
                    this.velocityX = 0;
                }
                this.x = Math.round(this.x);
                this.y = Math.round(this.y);
            } else {
                // is on ground
                this.lastGroundPosition.x = this.x;
                this.lastGroundPosition.y = this.y;
            }
        }
    }

    protected getGravity(): number {
        return GRAVITY;
    }

    public getGround(): SceneNode | null {
        return this.ground;
    }
}
