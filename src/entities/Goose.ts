import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { rndItem } from "../util";
import { Conversation } from "../Conversation";
import conversation from "../../assets/dialog/bird.dialog.json";
import { entity } from "../Entity";
import { GameObjectInfo } from "../MapInfo";
import { GameScene } from "../scenes/GameScene";
import { RenderingLayer } from "../Renderer";
import { ScriptableNPC } from "./ScriptableNPC";
import goose1 from "../../assets/dialog/goose1.dialog.json";

const IDLE_DURATION = [2, 3, 4];
const WALK_DURATION = [0.5, 1, 1.2, 1.5];
const ACCELERATION = 15;

@entity("goose")
export class Goose extends ScriptableNPC {
    @asset("sprites/goose.aseprite.json")
    private static sprite: Aseprite;

    private idleTimer: number | null = rndItem(IDLE_DURATION);
    private walkTimer: number | null = null;
    private autoMoveDirection: 1 | -1 = 1;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 28, 24);

        this.conversation = new Conversation(conversation, this);
        this.setMaxVelocity(2);
        this.conversation = new Conversation(goose1, this);
    }


    public getAnimationTag (): string {
        return "idle";
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.move === 0) {
            this.scene.renderer.addAseprite(
                Goose.sprite, this.getAnimationTag(), this.x, this.y, RenderingLayer.ENTITIES, this.direction
            );
        } else {
            this.scene.renderer.addAseprite(
                Goose.sprite, "walk", this.x, this.y, RenderingLayer.ENTITIES, this.direction
            );
        }

        if (this.scene.showBounds) this.drawBounds();

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        if (this.thinkBubble) {
            this.thinkBubble.draw(ctx);
        }

        this.speechBubble.draw(ctx);
    }

    public showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) return false;
        return false;
    }

    public update(dt: number): void {
        super.update(dt);

        // Triggers
        const triggerCollisions = this.scene.world.getTriggerCollisions(this);

        this.idleWalkingUpdateLogic(triggerCollisions, dt);

        if (this.hasActiveConversation()) {
            this.move = 0;
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

        this.dialoguePrompt.update(dt, this.x, this.y + 20);
        this.speechBubble.update(this.x, this.y);

        if (this.thinkBubble) {
            this.thinkBubble.update(this.x, this.y);
        }
    }

    private idleWalkingUpdateLogic(triggerCollisions: GameObjectInfo[], dt: number): void {
        if (triggerCollisions.length > 0) {
            const event = triggerCollisions.find(t => t.name === "goose_action");

            if (event && event.properties.velocity) {
                this.autoMoveDirection = event.properties.velocity > 0 ? 1 : -1;
                this.move = this.autoMoveDirection;
            }
        }

        if (this.idleTimer !== null && this.idleTimer >= 0) {
            this.idleTimer -= dt;
        }

        if (this.walkTimer !== null && this.walkTimer >= 0) {
            this.walkTimer -= dt;
        }

        if (this.idleTimer && this.idleTimer <= 0 && this.walkTimer === null) {
            this.walkTimer = rndItem(WALK_DURATION);
            this.idleTimer = null;
            this.move = this.autoMoveDirection;
        }

        if (this.walkTimer && this.walkTimer <= 0 && this.idleTimer === null) {
            this.idleTimer = rndItem(IDLE_DURATION);
            this.walkTimer = null;
            this.move = 0;
        }
    }
}
