import { Entity } from './Entity';
import { PIXEL_PER_METER, GRAVITY } from "./constants";
import { Environment } from "./World";

export abstract class PhysicsEntity extends Entity {
    private velocityX = 0;
    private velocityY = 0;
    private maxVelocityX = Infinity;
    private maxVelocityY = Infinity;
    private floating = false;

    public setFloating(floating: boolean): void {
        this.floating = floating;
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

    private checkCollision(x: number, y: number, ignore?: Environment[]): Environment {
        return this.game.world.collidesWith(x, y, [ this ], ignore);
    }

    private checkCollisionBox(x: number, y: number, ignore?: Environment[]): Environment {
        for (let i = -this.width / 2; i < this.width / 2; i++) {
            let env = this.checkCollision(x + i, y, ignore);
            if (env !== Environment.AIR) return env;
            env = this.checkCollision(x + i, y + this.height, ignore);
            if (env !== Environment.AIR) return env;
        }
        for (let i = 0; i < this.height; i++) {
            let env = this.checkCollision(x - this.width / 2, y + i, ignore);
            if (env !== Environment.AIR) return env;
            env = this.checkCollision(x + this.width / 2, y + i, ignore);
            if (env !== Environment.AIR) return env;
        }
        return Environment.AIR;
    }

    protected updatePosition(newX: number, newY: number): void {
        if (this.floating) {
            this.x = newX;
            this.y = newY;
        } else {
            const env = this.checkCollisionBox(newX, newY, newY > this.y ? [ Environment.PLATFORM ] : []);
            if (env === Environment.AIR) {
                this.x = newX;
                this.y = newY;
            } else {
                this.setVelocity(0, 0);
            }
        }
    }

    public update(dt: number): void {
        const world = this.game.world;

        const ground = world.getObjectAt(this.x, this.y - 5, [ this ]);
        if (ground instanceof PhysicsEntity) {
            this.x += ground.getVelocityX() * PIXEL_PER_METER * dt;
            this.y += ground.getVelocityY() * PIXEL_PER_METER * dt;
        }

        this.updatePosition(
            this.x + this.velocityX * PIXEL_PER_METER * dt,
            this.y + this.velocityY * PIXEL_PER_METER * dt
        );

        // Object dropping down when there is no ground below
        if (!this.floating) {
            if (world.collidesWith(this.x, this.y - 1, [ this ]) === 0) {
                this.velocityY -= this.getGravity() * dt;
            } else if (this.velocityY < 0) {
                this.velocityY = 0;
            }
        }
    }

    protected getGravity() {
        return GRAVITY;
    }
}
