import { NPC } from './NPC';
import { PIXEL_PER_METER } from './constants';
import { rnd, rndInt, shiftValue, calculateVolume } from './util';
import { ParticleEmitter, valueCurves } from './Particles';
import { Face, EyeType, FaceModes } from './Face';
import { FireGfx } from './FireGfx';
import { entity } from "./Entity";
import { Wood } from "./Wood";
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { QuestATrigger, QuestKey } from './Quests';
import { RenderingType, RenderingLayer } from './Renderer';
import { ShibaState } from './Shiba';
import { Sound } from './Sound';

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

    public intensity = 5;

    public state = FireState.IDLE;

    public angry = false; // fire will be angry once wood was fed

    public beingPutOut = false;

    public growthTarget = 5;

    public growth = 1;

    private averageParticleDelay = 0.1;
    private averageSteamDelay = 0.05;

    private isVisible = true;

    private fireGfx = new FireGfx();

    // private fireEmitter: ParticleEmitter;
    private sparkEmitter: ParticleEmitter;
    private smokeEmitter: ParticleEmitter;
    private steamEmitter: ParticleEmitter;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 1.5 * PIXEL_PER_METER, 1.85 * PIXEL_PER_METER);
        Fire.fireAmbience.setLoop(true);
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
        })
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

    public showDialoguePrompt (): boolean {
        if (!super.showDialoguePrompt()) return false;
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

    public isRendererd (): boolean {
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

    public setState (state: FireState): void {
        this.state = state;
        if (state === FireState.BEING_PUT_OUT || state === FireState.PUT_OUT) {
            Fire.fireAmbience.stop();
        }
    }

    public drawToCanvas (ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);
        ctx.scale(this.intensity / 5, this.intensity / 5);
        this.fireGfx.draw(ctx, 0, 0);
        ctx.restore();
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible) return;
        this.scene.renderer.add({ type: RenderingType.FIRE, layer: RenderingLayer.ENTITIES, entity: this })

        this.drawFace(ctx);
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }

        if (this.thinkBubble) {
            this.thinkBubble.draw(ctx);
        }

        this.speechBubble.draw(ctx);
        if (this.scene.showBounds) this.drawBounds();
    }

    update(dt: number): void {
        if (this.state === FireState.ANGRY && !this.beingPutOut) {
            this.face?.setMode(FaceModes.ANGRY);
        } else if (this.state === FireState.BEING_PUT_OUT) {
            this.face?.setMode(FaceModes.DISGUSTED);
        }

        if (this.intensity !== this.growthTarget) {
            this.intensity = shiftValue(this.intensity, this.growthTarget, this.growth * dt);
        }

        if (this.scene.friendshipCutscene && this.scene.shiba.getState() === ShibaState.KILLING_FIRE && this.intensity <= SHRINK_SIZE) {
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

            const vol = calculateVolume(this.distanceToPlayer, .7, 0.2);
            if (vol) {
                Fire.fireAmbience.setVolume(vol);
                if (!Fire.fireAmbience.isPlaying()) Fire.fireAmbience.play();
            } else {
                Fire.fireAmbience.stop();
            }
        }

        if (this.isBeingPutOut()) {
            let steamParticleChance = dt - rnd() * this.averageSteamDelay;
            while (steamParticleChance > 0) {
                this.steamEmitter.emit();
                steamParticleChance -= rnd() * this.averageSteamDelay;
            }
        }

        if (this.isVisible) {
            this.fireGfx.update(dt);
        }
        if (this.showDialoguePrompt()) {
            this.dialoguePrompt.update(dt, this.x, this.y + 32);
        }
        this.speechBubble.update(this.x, this.y);
    }

    public feed(wood: Wood) {
        wood.remove();
        // Handle end of the world
        this.state = FireState.ANGRY;
        this.growthTarget = 14;

        this.scene.startApocalypseMusic();

        // Disable remaining dialogs
        this.conversation = null;

        // Remove any reachable NPCs
        for (const npc of [this.scene.spider, this.scene.shadowPresence]) {
            if (npc) {
                this.scene.removeGameObject(npc);
            }
        }

        // Player thoughts
        [
            ["What…", 2, 2],
            ["What have I done?", 6, 3],
            ["I trusted you! I helped you!", 10, 3]
        ].forEach(line => setTimeout(() => {
            this.scene.player.think(line[0] as string, line[2] as number * 1000);
        }, (line[1] as number) * 1000));
        // Give fire new dialog
        setTimeout(() => {
            this.scene.game.campaign.runAction("enable", null, ["fire", "fire2"]);
        }, 13500);
    }
}
