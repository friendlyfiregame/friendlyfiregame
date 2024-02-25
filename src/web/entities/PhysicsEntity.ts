import { DROWNING_VELOCITY, GRAVITY, PIXEL_PER_METER, TERMINAL_VELOCITY } from "../../shared/constants";
import { Entity, type EntityArgs } from "../Entity";
import { type GameObject } from "../scenes/GameObject";
import { Environment } from "../World";

export interface PhysicsEntityArgs extends EntityArgs {
    velocityX?: number;
    velocityY?: number;
    maxVelocityX?: number;
    maxVelocityY?: number;
}

export abstract class PhysicsEntity extends Entity {
    private velocityX = 0;
    private velocityY = 0;
    private maxVelocityX = Infinity;
    private maxVelocityY = Infinity;
    private floating = false;
    private ground: GameObject | null = null;

    // This property describes how much the player hitbox grows when
    // this entity is carried. Defaults to the entities own height.
    public carryHeight = this.height;

    protected lastGroundPosition = { x: 0, y: 0 };

    public constructor({ velocityX = 0, velocityY = 0, maxVelocityX = Infinity, maxVelocityY = Infinity, ...args }: PhysicsEntityArgs) {
        super(args);
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.maxVelocityX = velocityX;
        this.maxVelocityY = velocityY;
    }

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
        return this.scene.world.collidesWith(x, y, [ this ], ignore);
    }

    private checkCollisionBox(x: number, y: number, ignore?: Environment[]): Environment {
        for (let i = -this.width / 2; i < this.width / 2; i++) {
            let env = this.checkCollision(x + i, y, ignore);

            if (env !== Environment.AIR) {
                return env;
            }

            env = this.checkCollision(x + i, y - this.height, ignore);

            if (env !== Environment.AIR) {
                return env;
            }
        }

        for (let i = 0; i < this.height; i++) {
            let env = this.checkCollision(x - this.width / 2, y - i, ignore);

            if (env !== Environment.AIR) {
                return env;
            }

            env = this.checkCollision(x + this.width / 2, y - i, ignore);

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

    /**
     * Overridden by Player class to indicate Player is jumping down.
     */
    protected isJumpDown(): boolean {
        return false;
    }

    /**
     * Overridden by Player class to indicate that
     */
    protected isPlayer(): boolean {
        return false;
    }

    protected isPhysicsEnabled(): boolean {
        return true;
    }

    public override update(dt: number): void {
        super.update(dt);
        if (!this.isPhysicsEnabled()) {
            return;
        }

        const world = this.scene.world;
        const ground = world.getObjectAt(this.x, this.y + 5, [ this ]);

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
                this.x, this.y + 1,
                [ this ],
                this.isJumpDown() ? [ Environment.PLATFORM ] : []
            );

            if (environment === Environment.AIR) {
                this.velocityY += this.getGravity() * dt;

                // Apply terminal velocity to falling entities
                if (this.velocityY > 0) {
                    this.velocityY = Math.min(this.velocityY, TERMINAL_VELOCITY);
                }
            } else if (environment === Environment.WATER) {
                this.velocityY = DROWNING_VELOCITY;
                this.velocityX = 0;
            } else if (this.velocityY > 0) {
                this.velocityY = 0;

                if (!(this.isPlayer())) {
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

    public getGround(): GameObject | null {
        return this.ground;
    }

    protected getCollisionIgnores(): Environment[] {
        return [ Environment.WATER ];
    }

    /**
     * If given coordinate collides with the world then the first free y coordinate above is
     * returned. This can be used to unstuck an object after a new position was set.
     *
     * @param x - X coordinate of current position.
     * @param y - Y coordinate of current position.
     * @return The Y coordinate of the ground below the given coordinate.
     */
    protected pullOutOfGround(): number {
        let pulled = 0, col = 0;

        if (this.getVelocityY() >= 0) {
            const world = this.scene.world;
            col = world.collidesWith(this.x, this.y, [ this ], this.getCollisionIgnores());
            while (this.y > 0 && col) {
                pulled++;
                this.y--;
                col = world.collidesWith(this.x, this.y, [ this ], this.getCollisionIgnores());
            }
        }

        return pulled;
    }

    /**
     * If given coordinate collides with the world then the first free y coordinate above is
     * returned. This can be used to unstuck an object after a new position was set.
     *
     * @param x - X coordinate of current position.
     * @param y - Y coordinate of current position.
     * @return The Y coordinate of the ground below the given coordinate.
     */
    protected pullOutOfCeiling(): number {
        let pulled = 0;
        const world = this.scene.world;
        const height = world.getHeight();

        while (this.y < height && world.collidesWith(this.x, this.y - this.height, [ this ], [ Environment.PLATFORM, Environment.WATER ])) {
            pulled++;
            this.y++;
        }

        return pulled;
    }

    protected pullOutOfWall(): number {
        let pulled = 0;
        const world = this.scene.world;

        if (this.getVelocityX() > 0) {
            while (
                world.collidesWithVerticalLine(
                    this.x + this.width / 2, this.y - this.height * 3 / 4,
                    this.height / 2,
                    [ this ],
                    [ Environment.PLATFORM, Environment.WATER ]
                )
            ) {
                this.x--;
                pulled++;
            }
        } else if (this.getVelocityX() < 0) {
            while (
                world.collidesWithVerticalLine(
                    this.x - this.width / 2, this.y - this.height * 3 / 4,
                    this.height / 2,
                    [ this ],
                    [ Environment.PLATFORM, Environment.WATER ]
                )
            ) {
                this.x++;
                pulled++;
            }
        }

        return pulled;
    }
}
