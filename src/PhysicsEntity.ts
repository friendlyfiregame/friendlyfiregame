import { Entity } from './Entity';
import { PIXEL_PER_METER, GRAVITY } from "./constants";

export abstract class PhysicsEntity extends Entity {
    private velocityX = 0;
    private velocityY = 0;
    private maxVelocityX = Infinity;
    private maxVelocityY = Infinity;

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

    /**
     * If given coordinate collides with the world then the first free Y coordinate above is returned. This can
     * be used to unstuck an object after a new position was set.
     *
     * @param x - X coordinate of current position.
     * @param y - Y coordinate of current position.
     * @return The Y coordinate of the ground below the given coordinate.
     */
    private pullOutOfGround(): number {
        let pulled = 0;
        const world = this.game.world;
        const height = world.getHeight();
        while (this.y < height && world.collidesWith(this.x, this.y)) {
            pulled++;
            this.y++;
        }
        return pulled;
    }

    /**
     * If given coordinate collides with the world then the first free Y coordinate above is returned. This can
     * be used to unstuck an object after a new position was set.
     *
     * @param x - X coordinate of current position.
     * @param y - Y coordinate of current position.
     * @return The Y coordinate of the ground below the given coordinate.
     */
    private pullOutOfCeiling(): number {
        let pulled = 0;
        const world = this.game.world;
        while (this.y > 0 && world.collidesWith(this.x, this.y + this.height)) {
            pulled++;
            this.y--;
        }
        return pulled;
    }

    private pullOutOfWall(): number {
        let pulled = 0;
        const world = this.game.world;
        if (this.velocityX > 0) {
            while (world.collidesWithVerticalLine(this.x + this.width / 2, this.y + this.height * 3 / 4, this.height / 2)) {
                this.x--;
                pulled++;
            }
        } else {
            while (world.collidesWithVerticalLine(this.x - this.width / 2, this.y + this.height * 3 / 4, this.height / 2)) {
                this.x++;
                pulled++;
            }
        }
        return pulled;
    }

    public update(dt: number): void {
        const world = this.game.world;

        // Move the player
        this.x += this.velocityX * PIXEL_PER_METER * dt;
        this.y += this.velocityY * PIXEL_PER_METER * dt;

        // Check collision with the environment and correct player position and movement
        if (this.pullOutOfGround() !== 0 || this.pullOutOfCeiling() !== 0) {
            this.velocityY = 0;
        }
        if (this.pullOutOfWall() !== 0) {
            this.velocityX = 0;
        }

        // Player dropping down when there is no ground below
        if (world.collidesWith(this.x, this.y - 1) === 0) {
            this.velocityY -= GRAVITY * dt;
        } else {
            this.velocityY = 0;
        }
    }
}
