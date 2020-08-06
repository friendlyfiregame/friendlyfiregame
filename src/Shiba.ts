import { entity } from "./Entity";
import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import conversation from '../assets/dialog/bird.dialog.json';
import { Conversation } from './Conversation';
import { RenderingLayer } from './Renderer';
import { ScriptableNPC } from './ScriptableNPC';
import shiba1 from '../assets/dialog/shiba1.dialog.json';
import shiba2 from '../assets/dialog/shiba2.dialog.json';
import { rndItem } from './util';

const IDLE_DURATION = [2, 3, 4];
const WALK_DURATION = [0.5, 1, 1.2, 1.5];
const ACCELERATION = 15;

export enum ShibaState {
    ON_TREE,
    ENDING_CUTSCENE
}


@entity("shiba")
export class Shiba extends ScriptableNPC {
    @asset("sprites/shiba.aseprite.json")
    private static sprite: Aseprite;
    private state = ShibaState.ON_TREE;
    private idleTimer: number | null = rndItem(IDLE_DURATION);
    private walkTimer: number | null = null;
    private autoMoveDirection: 1 | -1 = 1;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 28, 24);
        this.conversation = new Conversation(conversation, this);
        this.setMaxVelocity(2);
        this.conversation = new Conversation(shiba1, this);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.move === 0) {
            this.scene.renderer.addAseprite(Shiba.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES, this.direction)
        } else {
            this.scene.renderer.addAseprite(Shiba.sprite, "walk", this.x, this.y, RenderingLayer.ENTITIES, this.direction)
        }

        if (this.scene.showBounds) this.drawBounds();
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        if (this.thinkBubble) {
            this.thinkBubble.draw(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    public showDialoguePrompt (): boolean {
        if (!super.showDialoguePrompt()) return false;
        if (Conversation.getGlobals()['$broughtBone'] && !Conversation.getGlobals()['$talkedToShibaWithBone']) return true;
        return false;
    }

    update(dt: number): void {
        super.update(dt);

        // Triggers
        const triggerCollisions = this.scene.world.getTriggerCollisions(this);

        if (this.hasActiveConversation()) {
            this.move = 0;
        } else {
            if (this.state === ShibaState.ON_TREE) {
                if (triggerCollisions.length > 0) {
                    const event = triggerCollisions.find(t => t.name === 'shiba_action');
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

        this.dialoguePrompt.update(dt, this.x, this.y + 20);
        this.speechBubble.update(this.x, this.y);
        if (this.thinkBubble) {
            this.thinkBubble.update(this.x, this.y);
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

        // Check if Bone is near
        if (!Conversation.getGlobals()['$broughtBone'] && this.distanceTo(this.scene.bone) < 100) {
            Conversation.setGlobal('broughtBone', 'true');
            this.think('Wow! Bone!', 3000);
            this.conversation = new Conversation(shiba2, this);
        }
    }
}
