import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { GRAVITY } from "../constants";
import { entity } from "../Entity";
import { LevelId } from "../Levels";
import { GameScene } from "../scenes/GameScene";
import { Environment } from "../World";
import { Campfire } from "./Campfire";
import { ScriptableNPC } from "./ScriptableNPC";

enum State {
    SITTING = "sitting",
    GOING_AWAY = "goingAway",
    ENTERING_DOOR = "enteringDoor"
}

const ACCELERATION = 15;
@entity("caveman")
export class Caveman extends ScriptableNPC {
    @asset("sprites/caveman.aseprite.json")
    private static sprite: Aseprite;
    private state = State.SITTING;
    private jumpHeight = 0.75;
    private doorTimer = 1;

    public constructor(scene: GameScene, x: number, y: number, levelId: LevelId) {
        super(scene, x, y, 18, 24, levelId);
        this.animator.assignSprite(Caveman.sprite);
        this.setMaxVelocity(2);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.animator.play(this.getAnimationTag(), this.direction);

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        this.speechBubble.draw(ctx);
    }

    protected jump(): void {
        this.setVelocityY(Math.sqrt(2 * this.jumpHeight * GRAVITY));
    }

    public update(dt: number): void {
        super.update(dt);
        this.move = 0;
        const triggers = this.getWorld().getTriggerCollisions(this);

        if (this.state === State.GOING_AWAY) {
            this.move = -1;

            if (triggers.find(t => t.name === "caveman_stop_trigger")) this.state = State.ENTERING_DOOR;

            if (
                this.getWorld().collidesWithVerticalLine(
                    this.x - (this.width / 2) - 2, this.y + this.height,
                    this.height,
                    [ this ],
                    [ Environment.PLATFORM, Environment.WATER ]
                )
            ) {
                this.jump();
            }
        } else if (this.state === State.ENTERING_DOOR) {
            if (this.doorTimer === 0) {
                this.teleportOutside();
            }

            if (this.doorTimer > 0) {
                this.doorTimer -= dt;
                if (this.doorTimer < 0) {
                    this.doorTimer = 0;
                }
            }
        }

        if (this.move !== 0) {
            this.direction = this.move;
            this.accelerateX(ACCELERATION * dt * this.move);
        } else {
            if (this.getVelocityX() > 0) {
                this.decelerateX(ACCELERATION * dt);
            } else {
                this.decelerateX(-ACCELERATION * dt);
            }
        }

        this.speechBubble.update(this.x, this.y);
    }

    public teleportOutside (): void {
        console.log("Teleport");
        const cavemanSpawn = this.scene.pointsOfInterest.find(poi => poi.name === "caveman_outside_position");
        if (!cavemanSpawn) throw new Error("Cavemen outside spawn missing");
        this.x = cavemanSpawn.x;
        this.y = cavemanSpawn.y;
        this.scene.game.campaign.runAction("enable", null, ["caveman", "cavemanOutside1"]);
        this.state = State.SITTING;

        const campfireSpawn = this.scene.pointsOfInterest.find(poi => poi.name === "campfire_spawn");
        if (campfireSpawn) {
            const campfire = new Campfire(this.scene, campfireSpawn.x, campfireSpawn.y, this.levelId);
            this.scene.gameObjects.push(campfire);
        }
    }
    
    public giveDoubleJump (): void {
        this.scene.player.removeDoubleJump();
        this.conversation = null;
        this.leaveCave();
    }

    public initChaosRoute (): void {
        this.scene.game.campaign.runAction("enable", null, ["caveman", "caveman2"]);
    }

    public leaveCave (): void {
        this.state = State.GOING_AWAY;
        this.lookAtPlayer = false;
        this.direction = -1;
        this.conversation = null;
    }

    private getAnimationTag (): string {
        switch (this.state) {
            case State.SITTING: return "sitting";
            case State.GOING_AWAY: {
                if (this.move === 0) return "idle";
                return "walking";
            }
            default: return "idle";
        }
    }
}
