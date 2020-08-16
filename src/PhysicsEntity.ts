import { DROWNING_VELOCITY, GRAVITY, PIXEL_PER_METER, TERMINAL_VELOCITY } from './constants';
import { Entity } from './Entity';
import { Environment } from './World';
import { GameObject } from './scenes/GameScene';
import { Player } from './Player';
import { Point } from './Geometry'

export abstract class PhysicsEntity extends Entity {
    private velocityX = 0;
    private velocityY = 0;
    private maxVelocityX = Infinity;
    private maxVelocityY = Infinity;
    private floating = false;
    private ground: GameObject | null = null;
    protected lastGroundPosition = Point.ORIGIN;

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
            this.velocityX = Math.min(this.maxVelocityX, this.velocityX + x)
        } else {
            this.velocityX = Math.max(-this.maxVelocityX, this.velocityX + x)
        }
    }

    public accelerateY(y: number): void {
        this.velocityY = Math.min(this.maxVelocityY, this.velocityY + y)
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

    private checkCollision(position: Point, ignore?: Environment[]): Environment {
        return this.scene.world.collidesWith(position, [ this ], ignore);
    }

    private checkCollisionBox(x: number, y: number, ignore?: Environment[]): Environment {
        for (let i = -this.size.width / 2; i < this.size.width / 2; i++) {
            let env = this.checkCollision(new Point(x + i, y), ignore);
            if (env !== Environment.AIR) return env;
            env = this.checkCollision(new Point(x + i, y + this.size.height), ignore);
            if (env !== Environment.AIR) return env;
        }

        for (let i = 0; i < this.size.height; i++) {
            let env = this.checkCollision(new Point(x - this.size.width / 2, y + i), ignore);
            if (env !== Environment.AIR) return env;
            env = this.checkCollision(new Point(x + this.size.width / 2, y + i), ignore);
            if (env !== Environment.AIR) return env;
        }

        return Environment.AIR;
    }

    protected updatePosition(newX: number, newY: number): void {
        if (this.floating) {
            this.position.moveTo(newX, newY);
        } else {
            const env = this.checkCollisionBox(newX, newY, newY > this.position.y ? [ Environment.PLATFORM ] : []);
            if (env === Environment.AIR || env === Environment.WATER) {
                this.position.moveTo(newX, newY);
            } else {
                this.setVelocity(0, 0);
            }
        }
    }

    public update(dt: number): void {
        super.update(dt);

        const world = this.scene.world;
        const ground = world.getObjectAt(new Point(this.position.x, this.position.y - 5), [ this ]);

        if (ground instanceof PhysicsEntity) {
            this.position.moveBy(
                ground.getVelocityX() * PIXEL_PER_METER * dt,
                ground.getVelocityY() * PIXEL_PER_METER * dt
            );
        }

        this.ground = ground;

        this.updatePosition(
            this.position.x + this.velocityX * PIXEL_PER_METER * dt,
            this.position.y + this.velocityY * PIXEL_PER_METER * dt
        );

        // Object dropping down when there is no ground below
        if (!this.floating) {
            const environment = world.collidesWith(new Point(this.position.x, this.position.y - 1), [ this ],
                    this instanceof Player && this.jumpDown ? [ Environment.PLATFORM ] : []);

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

                this.position.moveTo(
                    this.position.xRounded,
                    this.position.yRounded
                )
            } else {
                // is on ground
                this.lastGroundPosition = this.position.clone();
            }
        }
    }

    protected getGravity() {
        return GRAVITY;
    }

    public getGround(): GameObject | null {
        return this.ground;
    }
}
