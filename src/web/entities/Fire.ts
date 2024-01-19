import { PIXEL_PER_METER } from "../../shared/constants";
import { asset } from "../Assets";
import { Sound } from "../audio/Sound";
import { SoundEmitter } from "../audio/SoundEmitter";
import { entity } from "../Entity";
import { EyeType, Face, FaceModes } from "../Face";
import { FireGfx } from "../FireGfx";
import type { ParticleEmitter} from "../Particles";
import { valueCurves } from "../Particles";
import { QuestATrigger, QuestKey } from "../Quests";
import { RenderingLayer, RenderingType } from "../Renderer";
import { GameScene } from "../scenes/GameScene";
import { rnd, rndInt, shiftValue, sleep } from "../util";
import { NPC } from "./NPC";
import { ShibaState } from "./Shiba";
import type { Wood } from "./Wood";

export const SHRINK_SIZE = 2;

export enum FireState {
    IDLE,
    ANGRY,
    BEING_PUT_OUT,
    PUT_OUT
}

@entity("fire")
export class Fire extends NPC {
    @asset("images/smoke.png")
    private static readonly smokeImage: HTMLImageElement;

    @asset("images/steam.png")
    private static readonly steamImage: HTMLImageElement;

    @asset("sounds/fire/fire.ogg")
    private static readonly fireAmbience: Sound;
    private readonly soundEmitter: SoundEmitter;

    public intensity = 5;

    public state = FireState.IDLE;

    public angry = false; // fire will be angry once wood was fed

    public beingPutOut = false;

    public growthTarget = 5;

    public growth = 1;

    private readonly averageParticleDelay = 0.1;
    private readonly averageSteamDelay = 0.05;

    private isVisible = true;

    private readonly fireGfx = new FireGfx();

    private readonly sparkEmitter: ParticleEmitter;
    private readonly smokeEmitter: ParticleEmitter;
    private readonly steamEmitter: ParticleEmitter;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 1.5 * PIXEL_PER_METER, 1.85 * PIXEL_PER_METER);

        this.soundEmitter = new SoundEmitter(this.scene, this.x, this.y, Fire.fireAmbience, 0.7, 0.2);

        this.smokeEmitter = this.scene.particles.createEmitter({
            position: {x: this.x, y: this.y},
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
        });

        this.steamEmitter = this.scene.particles.createEmitter({
            position: {x: this.x + 10, y: this.y},
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
        });

        this.sparkEmitter = this.scene.particles.createEmitter({
            position: {x: this.x, y: this.y},
            velocity: () => ({ x: rnd(-1, 1) * 30, y: rnd(50, 100) }),
            color: () => FireGfx.gradient.getCss(rnd() ** 0.5),
            size: 2,
            gravity: {x: 0, y: -100},
            lifetime: () => rnd(1, 1.5),
            blendMode: "screen",
            alpha: () => rnd(0.3, 1),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });

        this.face = new Face(scene, this, EyeType.STANDARD, 0, 6);
    }

    public override showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        return (
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() === QuestATrigger.JUST_ARRIVED ||
            (
                this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.GOT_WOOD &&
                this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.TALKED_TO_FIRE_WITH_WOOD
            ) ||
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() === QuestATrigger.THROWN_WOOD_INTO_FIRE ||
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() === QuestATrigger.BEAT_FIRE
        );
    }

    public isRendered(): boolean {
        return this.isVisible;
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

    public drawToCanvas(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);
        ctx.scale(this.intensity / 5, this.intensity / 5);
        this.fireGfx.draw(ctx, 0, 0);

        ctx.restore();
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible) {
            return;
        }

        this.scene.renderer.add({ type: RenderingType.FIRE, layer: RenderingLayer.ENTITIES, entity: this });
        this.drawFace(ctx);

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        if (this.thinkBubble) {
            this.thinkBubble.draw(ctx);
        }

        this.speechBubble.draw(ctx);

        if (this.scene.showBounds) {
            this.drawBounds();
        }
    }

    public override update(dt: number): void {
        if (this.state === FireState.ANGRY && !this.beingPutOut) {
            this.face?.setMode(FaceModes.ANGRY);
        } else if (this.state === FireState.BEING_PUT_OUT) {
            this.face?.setMode(FaceModes.DISGUSTED);
        }

        if (this.intensity !== this.growthTarget) {
            this.intensity = shiftValue(this.intensity, this.growthTarget, this.growth * dt);
        }

        if (
            this.scene.friendshipCutscene
            && this.scene.shiba.getState() === ShibaState.KILLING_FIRE
            && this.intensity <= SHRINK_SIZE
        ) {
            this.scene.shiba.nextState();
        }

        if (!this.scene.camera.isPointVisible(this.x, this.y, 200)) {
            this.isVisible = false;
            return;
        }

        this.isVisible = true;

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

        if (this.isVisible) {
            this.fireGfx.update();
        }

        if (this.showDialoguePrompt()) {
            this.dialoguePrompt.update(dt, this.x, this.y + 32);
        }

        this.speechBubble.update(this.x, this.y);
    }

    public async feed(wood: Wood): Promise<void> {
        wood.remove();

        this.scene.setGateDisabled("shadowgate_door_1", false);

        // Handle end of the world
        this.state = FireState.ANGRY;
        this.growthTarget = 14;

        this.scene.startApocalypseMusic();

        // Disable remaining dialogs
        this.conversation = null;

        // Remove any reachable NPCs
        for (const npc of [this.scene.shadowPresence]) {
            if (npc != null) {
                this.scene.removeGameObject(npc);
            }
        }

        // Player thoughts (Though message, Delay in milliseconds, duration in milliseconds)
        const thoughts = [
            ["What…", 2000, 2000],
            ["What have I done?", 2000, 3000],
            ["I trusted you! I helped you!", 2000, 3000]
        ] as const;
        for (const [ thought, delay, duration ] of thoughts) {
            await sleep(delay);
            await this.scene.player.think(thought, duration);
        }
        await sleep(500);
        this.scene.game.campaign.runAction("enable", null, ["fire", "fire2"]);
    }
}
