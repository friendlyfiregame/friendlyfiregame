import { Environment } from './World';
import { NPC } from './NPC';
import { Point } from './Geometry';

export abstract class ScriptableNPC extends NPC {
    protected move: 0 | 1 | -1  = 0;

    protected updatePosition(newPosition: Point): void {
        this.position.moveTo(newPosition);

        // Check collision with the environment and correct player position and movement
        if (this.pullOutOfGround() !== 0 || this.pullOutOfCeiling() !== 0) {
            this.setVelocityY(0);
        }
        if (this.pullOutOfWall() !== 0) {
            this.setVelocityX(0);
        }
    }

    private pullOutOfGround(): number {
        let pulled = 0, col = 0;
        if (this.getVelocityY() <= 0) {
            const world = this.scene.world;
            const height = world.getHeight();
            col = world.collidesWith(this.position, [ this ], [ Environment.WATER ]);

            while (this.position.y < height && col) {
                pulled++;
                this.position.moveDown();
                col = world.collidesWith(this.position);
            }
        }
        return pulled;
    }

    private pullOutOfCeiling(): number {
        let pulled = 0;
        const world = this.scene.world;

        while (
            this.position.y > 0
            && world.collidesWith(
                this.position.clone().moveYBy(this.size.height), [ this ],
                [ Environment.PLATFORM, Environment.WATER ]
            )
        ) {
            pulled++;
            this.position.moveUp();
        }

        return pulled;
    }

    private pullOutOfWall(): number {
        let pulled = 0;
        const world = this.scene.world;
        if (this.getVelocityX() > 0) {
            while (
                world.collidesWithVerticalLine(
                    this.position.clone().moveBy(this.size.width / 2, this.size.height * 3 / 4),
                    this.size.height / 2, [ this ], [ Environment.PLATFORM, Environment.WATER ]
                )
            ) {
                this.position.moveLeft();
                pulled++;
            }
        } else {
            while (
                world.collidesWithVerticalLine(
                    this.position.clone().moveBy(-this.size.width / 2, this.size.height * 3 / 4),
                    this.size.height / 2, [ this ], [ Environment.PLATFORM, Environment.WATER ]
                )
            ) {
                this.position.moveRight();
                pulled++;
            }
        }
        return pulled;
    }

    public update(dt: number): void {
        super.update(dt);
    }
}
