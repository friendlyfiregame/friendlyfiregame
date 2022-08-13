import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import { NPC } from "./NPC";
import { QuestATrigger, QuestKey } from "../Quests";
import { Sound } from "../Sound";
import { SoundEmitter } from "../SoundEmitter";

enum AnimationTag {
    INVISIBLE = "invisible",
    IDLE = "idle",
    IDLE2 = "idle2",
    SITTING = "sitting"
}

enum State {
    OUTSIDE = "outside",
    INSIDE_PLAYING = "insidePlaying",
    INSIDE_CHAOS = "insideAfraid"
}

@entity("shadowpresence")
export class ShadowPresence extends NPC {
    @asset("sprites/shadowpresence.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/ambient/cave.ogg")
    private static caveAmbience: Sound;
    private soundEmitter: SoundEmitter;

    private isNearPlayer = false;
    private state = State.OUTSIDE;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 12, 46);
        this.direction = -1;
        this.lookAtPlayer = false;
        this.soundEmitter = new SoundEmitter(this.scene, this.x, this.y, ShadowPresence.caveAmbience, 0.3, 1);
        this.animator.assignSprite(ShadowPresence.sprite);
    }

    protected showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        return (
            this.isNearPlayer
            && this.scene.game.campaign.getQuest(QuestKey.A).isTriggered(QuestATrigger.TALKED_TO_FIRE)
            && !this.scene.game.campaign.getQuest(QuestKey.A).isTriggered(QuestATrigger.GOT_RUNNING_ABILITY)
        );
    }

    private getIdleAnimationTag (): AnimationTag {
        switch (this.state) {
            case State.OUTSIDE: return AnimationTag.IDLE;
            case State.INSIDE_CHAOS: return AnimationTag.IDLE2;
            case State.INSIDE_PLAYING: return AnimationTag.SITTING;
        }
    }

    /**
     * This will move the shadow guy back into his lair and change his dialog etc for the
     * chaos ending route.
     */
    public initChaosRoute (): void {
        const spawn = this.scene.pointsOfInterest.find(poi => poi.name === "shadowpresence_chaos_spawn");
        if (!spawn) throw new Error("Spawn named 'shadowpresence_chaos_spawn' not found");
        this.scene.shadowPresence.setPosition(spawn?.x, spawn?.y);
        this.scene.game.campaign.runAction("enable", null, ["shadowpresence", "shadowpresenceChaos1"]);
        this.scene.setGateDisabled("shadowgate_door_1", false);
        this.state = State.INSIDE_CHAOS;
    }

    /**
     * As soon as the fire is fed, this guy will head home and can be accessed for
     * an optional ending
     */
    public sendHome (): void {
        const spawn = this.scene.pointsOfInterest.find(poi => poi.name === "shadowpresence_chaos_spawn");
        if (!spawn) throw new Error("Spawn named 'shadowpresence_chaos_spawn' not found");
        this.scene.shadowPresence.setPosition(spawn?.x, spawn?.y);
        this.scene.game.campaign.runAction("enable", null, ["shadowpresence", "shadowpresenceHome1"]);
        this.scene.setGateDisabled("shadowgate_door_1", false);
        this.state = State.INSIDE_PLAYING;
    }

    private getAnimationTag (): AnimationTag {
        if (this.state === State.OUTSIDE) {
            return this.isNearPlayer ? this.getIdleAnimationTag() : AnimationTag.INVISIBLE;
        } else {
            return this.getIdleAnimationTag();
        }
    }


    public draw(ctx: CanvasRenderingContext2D): void {
        const animationTag = this.getAnimationTag();
        this.animator.play(animationTag, this.direction);

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        this.speechBubble.draw(ctx);
    }

    public checkPlayerDistance(): void {
        this.isNearPlayer = false;
        if (this.distanceTo(this.scene.player) < 60) {
            this.isNearPlayer = true;
        }
    }

    public update(dt: number): void {
        super.update(dt);

        this.checkPlayerDistance();
        this.dialoguePrompt.update(dt, this.x, this.y + 48);
        this.speechBubble.update(this.x, this.y + 12);
        this.soundEmitter.update();
    }
}
