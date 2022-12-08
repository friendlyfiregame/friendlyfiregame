import { asset } from "../Assets";
import { entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import { NPC } from "./NPC";
import { QuestATrigger, QuestKey } from "../Quests";
import { Aseprite } from "../Aseprite";
import { LevelId } from "../Levels";

@entity("wing")
export class Wing extends NPC {
    @asset("sprites/wing.aseprite.json")
    private static sprite: Aseprite;

    private floatAmount = 4;
    private floatSpeed = 2;
    private isBeingDisintegrated = false;

    public constructor(scene: GameScene, x: number, y: number, levelId: LevelId) {
        super(scene, x, y, 24, 24, levelId);
        this.animator.assignSprite(Wing.sprite);
        this.lookAtPlayer = false;
    }

    protected showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        return (
            this.scene.game.campaign.getQuest(QuestKey.A).isTriggered(QuestATrigger.PLANTED_SEED)
            && !this.scene.game.campaign.getQuest(QuestKey.A).isTriggered(QuestATrigger.LEARNED_RAIN_DANCE)
        );
    }

    public pickupAgainstWill (): void {
        this.isBeingDisintegrated = true;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;

        if (this.isBeingDisintegrated) {
            this.animator.play("disintegrate", this.direction, { loop: false, callback: this.grantFlying.bind(this) });
        } else {
            this.animator.addOffset(0, floatOffsetY).play("idle", this.direction);
        }

        // this.scene.renderer.addAseprite(
        //     Wing.sprite,
        //     "idle",
        //     this.x, this.y - floatOffsetY,
        //     RenderingLayer.ENTITIES
        // );

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        this.speechBubble.draw(ctx);
    }

    public update(dt: number): void {
        super.update(dt);

        this.dialoguePrompt.update(dt, this.x, this.y + 16);
        this.speechBubble.update(this.x, this.y);
    }

    private grantFlying (): void {
        this.scene.player.enableFlying();
        this.scene.removeGameObject(this);
    }
}
