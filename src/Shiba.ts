import { entity } from "./Entity";
import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { NPC } from './NPC';
import { PLAYER_ACCELERATION_AIR, MAX_PLAYER_SPEED } from "./constants";
import { Environment } from './World';
import conversation from '../assets/dialog/bird.dialog.json';
import { Conversation } from './Conversation';
import { RenderingLayer } from './Renderer';

@entity("shiba")
export class Shiba extends NPC {
    @asset("sprites/shiba.aseprite.json")
    private static sprite: Aseprite;
    private move: 0 | 1 | -1  = 1;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 28, 24);
        this.conversation = new Conversation(conversation, this);
        this.setMaxVelocity(MAX_PLAYER_SPEED)
    }

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
            const world = this.scene.world;
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
        const world = this.scene.world;
        while (this.y > 0 && world.collidesWith(this.x, this.y + this.height, [ this ],
                [ Environment.PLATFORM, Environment.WATER ])) {
            pulled++;
            this.y--;
        }
        return pulled;
    }

    private pullOutOfWall(): number {
        let pulled = 0;
        const world = this.scene.world;
        if (this.getVelocityX() > 0) {
            while (world.collidesWithVerticalLine(this.x + this.width / 2, this.y + this.height * 3 / 4,
                    this.height / 2, [ this ], [ Environment.PLATFORM, Environment.WATER ])) {
                this.x--;
                pulled++;
            }
        } else {
            while (world.collidesWithVerticalLine(this.x - this.width / 2, this.y + this.height * 3 / 4,
                    this.height / 2, [ this ], [ Environment.PLATFORM, Environment.WATER ])) {
                this.x++;
                pulled++;
            }
        }
        return pulled;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(Shiba.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES, this.direction)
        if (this.scene.showBounds) this.drawBounds();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.move = 0;

        // Triggers
        // const triggerCollisions = this.scene.world.getTriggerCollisions(this);

        if (this.move !== 0) {
            this.direction = this.move;
            this.accelerateX(PLAYER_ACCELERATION_AIR * dt * this.move);
        } else {
            if (this.getVelocityX() > 0) {
                this.decelerateX(PLAYER_ACCELERATION_AIR * dt);
            } else {
                this.decelerateX(-PLAYER_ACCELERATION_AIR * dt);
            }
        }

        this.speechBubble.update(this.x, this.y);
    }
}
