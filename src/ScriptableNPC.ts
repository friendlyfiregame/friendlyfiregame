import { Environment } from "./World";
import { NPC } from "./NPC";

export abstract class ScriptableNPC extends NPC {
    protected move: 0 | 1 | -1  = 0;

    protected updatePosition(newX: number, newY: number): void {
        this.x = newX;
        this.y = newY;

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
            const world = this.gameScene.world;
            const height = world.getHeight();
            col = world.collidesWith(this.x, this.y, [ this ], [ Environment.WATER ]);

            while (this.y < height && col) {
                pulled++;
                this.y++;
                col = world.collidesWith(this.x, this.y);
            }
        }

        return pulled;
    }

    private pullOutOfCeiling(): number {
        let pulled = 0;
        const world = this.gameScene.world;

        while (
            this.y > 0
            && world.collidesWith(
                this.x, this.y + this.height,
                [ this ],
                [ Environment.PLATFORM, Environment.WATER ]
            )
        ) {
            pulled++;
            this.y--;
        }

        return pulled;
    }

    private pullOutOfWall(): number {
        let pulled = 0;
        const world = this.gameScene.world;

        if (this.getVelocityX() > 0) {
            while (
                world.collidesWithVerticalLine(
                    this.x + this.width / 2, this.y + this.height * 3 / 4,
                    this.height / 2,
                    [ this ],
                    [ Environment.PLATFORM, Environment.WATER ]
                )
            ) {
                this.x--;
                pulled++;
            }
        } else {
            while (
                world.collidesWithVerticalLine(
                    this.x - this.width / 2, this.y + this.height * 3 / 4,
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
