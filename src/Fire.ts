import { asset } from "./Assets";
import { entity } from "./Entity";
import { EyeType, Face, FaceModes } from "./Face";
import { FireGfx } from "./FireGfx";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import { ParticleNode, valueCurves } from "./Particles";
import { PIXEL_PER_METER } from "./constants";
import { QuestATrigger, QuestKey } from "./Quests";
import { RenderingLayer } from "./RenderingLayer";
import { rnd, rndInt, shiftValue } from "./util";
import { ShibaState } from "./Shiba";
import { Sound } from "./Sound";
import { SoundEmitter } from "./SoundEmitter";
import { Wood } from "./Wood";

export const SHRINK_SIZE = 2;

export enum FireState {
    IDLE,
    ANGRY,
    BEING_PUT_OUT,
    PUT_OUT
}

@entity("fire")
export class Fire extends NPC {
    @asset("sprites/smoke.png")
    private static smokeImage: HTMLImageElement;

    @asset("sprites/steam.png")
    private static steamImage: HTMLImageElement;

    @asset("sounds/fire/fire.ogg")
    private static fireAmbience: Sound;
    private soundEmitter: SoundEmitter;

    public intensity = 5;

    public state = FireState.IDLE;

    public angry = false; // fire will be angry once wood was fed

    public beingPutOut = false;

    public growthTarget = 5;

    public growth = 1;

    private averageParticleDelay = 0.1;
    private averageSteamDelay = 0.05;

    private fireGfx = new FireGfx();

    private sparkEmitter: ParticleNode;
    private smokeEmitter: ParticleNode;
    private steamEmitter: ParticleNode;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 1.5 * PIXEL_PER_METER, 1.85 * PIXEL_PER_METER);
        this.setLayer(RenderingLayer.ENTITIES);

        this.soundEmitter = new SoundEmitter(this.gameScene, this.x, this.y, Fire.fireAmbience, 0.7, 0.2);

        this.smokeEmitter = new ParticleNode({
            offset: () => ({ x: rnd(-1, 1) * 3 * this.intensity, y: rnd(2) * this.intensity }),
            velocity: () => ({ x: rnd(-1, 1) * 15, y: 4 + rnd(3) }),
            color: () => Fire.smokeImage,
            size: () => rndInt(24, 32),
            gravity: {x: 0, y: 8},
            lifetime: () => rnd(5, 8),
            alpha: () => rnd(0.2, 0.45),
            angleSpeed: () => rnd(-1, 1) * 1.5,
            blendMode: "source-over",
            alphaCurve: valueCurves.cos(0.1, 0.5),
            breakFactor: 0.85
        }).appendTo(this);

        this.steamEmitter = new ParticleNode({
            offset: () => ({ x: rnd(-1, 1) * 3, y: 0 }),
            velocity: () => ({ x: rnd(-1, 2) * 5, y: 50 + rnd(3) }),
            color: () => Fire.steamImage,
            size: () => rndInt(12, 18),
            gravity: {x: 0, y: 8},
            lifetime: () => rnd(1, 3),
            alpha: () => rnd(0.5, 0.8),
            angleSpeed: () => rnd(-1, 1) * 3,
            blendMode: "source-over",
            alphaCurve: valueCurves.cos(0.1, 0.5),
            renderingLayer: RenderingLayer.ENTITIES,
            zIndex: 1,
            breakFactor: 0.5
        }).appendTo(this);

        this.sparkEmitter = new ParticleNode({
            velocity: () => ({ x: rnd(-1, 1) * 30, y: rnd(50, 100) }),
            color: () => FireGfx.gradient.getCss(rnd() ** 0.5),
            size: 2,
            gravity: {x: 0, y: -100},
            lifetime: () => rnd(1, 1.5),
            blendMode: "screen",
            alpha: () => rnd(0.3, 1),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        }).appendTo(this);

        this.face = new Face(scene, EyeType.STANDARD, true, 0, 6).appendTo(this);
    }

    public showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        return (
            this.gameScene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() === QuestATrigger.JUST_ARRIVED ||
            (
                this.gameScene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.GOT_WOOD &&
                this.gameScene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.TALKED_TO_FIRE_WITH_WOOD
            ) ||
            this.gameScene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() === QuestATrigger.THROWN_WOOD_INTO_FIRE ||
            this.gameScene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() === QuestATrigger.BEAT_FIRE
        );
    }

    public isAngry(): boolean {
        return this.state === FireState.ANGRY;
    }

    public isBeingPutOut(): boolean {
        return this.state === FireState.BEING_PUT_OUT;
    }

    public isPutOut(): boolean {
        return this.state === FireState.PUT_OUT;
    }

    public setState(state: FireState): void {
        this.state = state;
        if (state === FireState.BEING_PUT_OUT || state === FireState.PUT_OUT) {
            Fire.fireAmbience.stop();
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible) {
            return;
        }

        ctx.save();
        ctx.scale(this.intensity / 5, this.intensity / 5);
        this.fireGfx.draw(ctx, 0, 0);
        ctx.restore();
    }

    public update(dt: number): void {
        super.update(dt);
        if (this.state === FireState.ANGRY && !this.beingPutOut) {
            this.face?.setMode(FaceModes.ANGRY);
        } else if (this.state === FireState.BEING_PUT_OUT) {
            this.face?.setMode(FaceModes.DISGUSTED);
        }

        if (this.intensity !== this.growthTarget) {
            this.intensity = shiftValue(this.intensity, this.growthTarget, this.growth * dt);
        }

        if (
            this.gameScene.friendshipCutscene
            && this.gameScene.shiba.getState() === ShibaState.KILLING_FIRE
            && this.intensity <= SHRINK_SIZE
        ) {
            this.gameScene.shiba.nextState();
        }

        if (!this.gameScene.camera.isPointVisible(this.x, this.y, 200)) {
            this.hide();
            return;
        }

        this.show();

        if (!this.isBeingPutOut() && !this.isPutOut()) {
            let particleChance = dt - rnd() * this.averageParticleDelay;

            while (particleChance > 0) {
                if (rnd() < 0.5) {
                    this.sparkEmitter.emit();
                }

                if (rnd() < 0.32) {
                    this.smokeEmitter.emit();
                }

                particleChance -= rnd() * this.averageParticleDelay;
            }

            this.soundEmitter.update();
        }

        if (this.isBeingPutOut()) {
            let steamParticleChance = dt - rnd() * this.averageSteamDelay;

            while (steamParticleChance > 0) {
                this.steamEmitter.emit();
                steamParticleChance -= rnd() * this.averageSteamDelay;
            }
        }

        if (this.isVisible()) {
            this.fireGfx.update();
        }

        if (this.showDialoguePrompt()) {
            this.dialoguePrompt.updatePosition(0, 32);
        }
    }

    public feed(wood: Wood): void {
        wood.remove();

        // Handle end of the world
        this.state = FireState.ANGRY;
        this.growthTarget = 14;

        this.gameScene.startApocalypseMusic();

        // Disable remaining dialogs
        this.conversation = null;

        // Remove any reachable NPCs
        for (const npc of [this.gameScene.shadowPresence]) {
            if (npc) {
                this.gameScene.removeGameObject(npc);
            }
        }

        // Player thoughts
        [
            ["What…", 2, 2],
            ["What have I done?", 6, 3],
            ["I trusted you! I helped you!", 10, 3]
        ].forEach(line => setTimeout(() => {
            this.gameScene.player.think(line[0] as string, line[2] as number * 1000);
        }, (line[1] as number) * 1000));

        // Give fire new dialog
        setTimeout(() => {
            this.gameScene.game.campaign.runAction("enable", null, ["fire", "fire2"]);
        }, 13500);
    }
}
