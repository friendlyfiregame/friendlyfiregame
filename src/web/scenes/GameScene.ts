import "../entities/RiddleStone";
import "../entities/MovingPlatform";
import "../entities/Campfire";
import "../entities/Radio";
import "../entities/Skull";
import "../entities/Chicken";
import "../entities/SuperThrow";
import "../entities/Portal";
import "../entities/Window";

import {
    DIALOG_FONT, GAME_CANVAS_WIDTH, PETTING_ENDING_CUTSCENE_DURATION, PETTING_ENDING_FADE_DURATION, WINDOW_ENDING_CUTSCENE_DURATION,
    WINDOW_ENDING_FADE_DURATION
} from "../../shared/constants";
import { asset } from "../Assets";
import { Sound } from "../audio/Sound";
import { BitmapFont } from "../BitmapFont";
import { Camera } from "../Camera";
import { CameraBounds } from "../CameraBounds";
import { Conversation } from "../Conversation";
import { Bird } from "../entities/Bird";
import { Bone } from "../entities/Bone";
import { Caveman } from "../entities/Caveman";
import { Cloud } from "../entities/Cloud";
import { ExitPortal } from "../entities/ExitPortal";
import { Fire } from "../entities/Fire";
import { FireState } from "../entities/FireState";
import { FlameBoy } from "../entities/FlameBoy";
import { Gate } from "../entities/gates/Gate";
import { Mimic } from "../entities/Mimic";
import { Player } from "../entities/Player";
import { BossCloud } from "../entities/pointers/BossCloud";
import { BossSpawn } from "../entities/pointers/BossSpawn";
import { FriendshipPlayerPosition } from "../entities/pointers/FriendshipPlayerPosition";
import { WindowZoomTarget } from "../entities/pointers/WindowZoomTarget";
import { PowerShiba } from "../entities/PowerShiba";
import { type Seed } from "../entities/Seed";
import { ShadowPresence } from "../entities/ShadowPresence";
import { Shiba } from "../entities/Shiba";
import { ShibaState } from "../entities/ShibaState";
import { Stone } from "../entities/Stone";
import { StoneDisciple } from "../entities/StoneDisciple";
import { Tree } from "../entities/Tree";
import { Trigger } from "../entities/triggers/Trigger";
import { Wing } from "../entities/Wing";
import { type Bounds, createEntity, Entity  } from "../Entity";
import { FireGfx } from "../FireGfx";
import { type FriendlyFire } from "../FriendlyFire";
import { type ControllerEvent } from "../input/ControllerEvent";
import { MapInfo} from "../MapInfo";
import { MenuList } from "../Menu";
import { MountainRiddle } from "../MountainRiddle";
import { type ParticleEmitter, Particles, valueCurves } from "../Particles";
import { QuestATrigger, QuestKey } from "../Quests";
import { Renderer, RenderingLayer, RenderingType } from "../Renderer";
import { Scene } from "../Scene";
import { clamp, isDev, rnd, rndItem, sleep, timedRnd } from "../util";
import { isInstanceOf } from "../util/predicates";
import { type Constructor } from "../util/types";
import { World } from "../World";
import { AmbientSoundId } from "./AmbientSoundId";
import { BgmId } from "./BgmId";
import { EndScene } from "./EndScene";
import { FadeDirection } from "./FadeDirection";
import { type GameObject } from "./GameObject";
import { PauseScene } from "./PauseScene";
import { TitleScene } from "./TitleScene";

type BackgroundTrack = {
    active: boolean;
    id: BgmId;
    sound: Sound,
    baseVolume: number;
};

type PetEndingText = {
    label: string;
    enter: number;
};

export class GameScene extends Scene<FriendlyFire> {
    @asset("music/theme_01.ogg")
    public static bgm1: Sound;

    @asset("music/inferno.ogg")
    public static bgm2: Sound;

    @asset("music/cave.ogg")
    public static bgmCave: Sound;

    @asset("music/riddle.ogg")
    public static bgmRiddle: Sound;

    @asset("music/radio.ogg")
    public static bgmRadio: Sound;

    @asset("music/ecstasy.ogg")
    public static bgmEcstasy: Sound;

    @asset("music/wings.ogg")
    public static bgmWings: Sound;

    @asset("music/awake.ogg")
    public static bgmAwake: Sound;

    @asset("music/shadowgate.ogg")
    public static bgmShadowgate: Sound;

    @asset("sounds/ambient/stream.ogg")
    public static ambientStream: Sound;

    @asset("sounds/ambient/wind.ogg")
    public static ambientWind: Sound;

    public readonly ambientSounds: Record<AmbientSoundId, Sound> = {
        [AmbientSoundId.STREAM]: GameScene.ambientStream,
        [AmbientSoundId.WIND]: GameScene.ambientWind
    };

    public override get urlFragment(): string {
        return "#game";
    }

    private readonly backgroundTracks: BackgroundTrack[] = [
        {
            active: false,
            id: BgmId.OVERWORLD,
            sound: GameScene.bgm1,
            baseVolume: 0.25
        },
        {
            active: false,
            id: BgmId.CAVE,
            sound: GameScene.bgmCave,
            baseVolume: 1
        },
        {
            active: false,
            id: BgmId.INFERNO,
            sound: GameScene.bgm2,
            baseVolume: 0.10
        },
        {
            active: false,
            id: BgmId.RIDDLE,
            sound: GameScene.bgmRiddle,
            baseVolume: 1
        },
        {
            active: false,
            id: BgmId.RADIO,
            sound: GameScene.bgmRadio,
            baseVolume: 1
        },
        {
            active: false,
            id: BgmId.WINGS,
            sound: GameScene.bgmWings,
            baseVolume: 0.75
        },
        {
            active: false,
            id: BgmId.AWAKE,
            sound: GameScene.bgmAwake,
            baseVolume: 0.75
        },
        {
            active: false,
            id: BgmId.ECSTASY,
            sound: GameScene.bgmEcstasy,
            baseVolume: 1
        },
        {
            active: false,
            id: BgmId.SHADOWGATE,
            sound: GameScene.bgmShadowgate,
            baseVolume: 1
        }
    ];

    @asset(DIALOG_FONT)
    private static readonly font: BitmapFont;

    @asset("sounds/ending/swell.mp3")
    private static readonly swell: Sound;

    @asset("sounds/gate/wrong.ogg")
    public static wrong: Sound;

    private readonly petEndingTexts: PetEndingText[] = [
        { label: "The sensation lacks any kind of comparison.", enter: 0.1 },
        { label: "All worldly matters seem so insignificant now.", enter: 0.2 },
        { label: "Reality around me begins to fade.", enter: 0.3 },
        { label: "Soon, I will be swept away in ecstasy.", enter: 0.5 },
        { label: "Can I muster up the strength to break free?", enter: 0.6 },
        { label: "If I don't stop now, there will be no going back.", enter: 0.7 },
        { label: "Is this really how it all ends?", enter: 0.8 },
        { label: "I regret nothing…", enter: 0.9 },
        { label: "Farewell, cruel world…", enter: 1 }
    ];

    private readonly windowEndingTexts: PetEndingText[] = [
        { label: "I wiped off the heavy dust layer on the glass.", enter: 0.1 },
        { label: "The surface was as cold as the corpses around me.", enter: 0.2 },
        { label: "It was hard to make out anything in the darkness on the other side…", enter: 0.3 },
        { label: "", enter: 0.4 },
        { label: "My legs gave away when I realized what I was looking at.", enter: 0.5 },
        { label: "Nothing can compare to the dread I felt in this moment.", enter: 0.6 },
        { label: "", enter: 0.7 },
        { label: "I wished I could go back to the dream I faintly remember.", enter: 0.8 },
        { label: "But there was nothing but an inevitable death waiting for me…", enter: 0.9 },
    ];

    /* Total game time (time passed while game not paused) */
    public gameTime = 0;

    public gameObjects: GameObject[] = [];
    public paused = false;
    public world!: World;
    public camera!: Camera;
    public player!: Player;
    public stone!: Stone;
    public stoneDisciple!: StoneDisciple;
    public tree!: Tree;
    public seed!: Seed;
    public bone!: Bone;
    public flameboy!: FlameBoy;
    public wing!: Wing;
    public bird!: Bird;
    public shiba!: Shiba;
    public powerShiba!: PowerShiba;
    public mimic!: Mimic;
    public shadowPresence!: ShadowPresence;
    public caveman!: Caveman;
    public particles = new Particles(this);
    public fire!: Fire;
    public exitPortal!: ExitPortal;
    public fireFuryEndTime = 0;
    public apocalypse = false;
    public friendshipCutscene = false;
    public pettingCutscene = false;
    public windowCutscene = false;
    public windowCutsceneTime = 0;
    public pettingCutsceneTime = 0;
    private pettingEndingTriggered = false;
    private windowEndingTriggered = false;
    private apocalypseFactor = 1;
    private fireEffects: FireGfx[] = [];
    private fireEmitter!: ParticleEmitter;
    private frameCounter = 0;
    private framesPerSecond = 0;
    public showBounds = false;
    private mapInfo!: MapInfo;
    public dt: number = 0;
    private fpsInterval: number | null = null;
    private fadeToBlackEndTime = 0;
    private fadeToBlackStartTime = 0;
    private fadeToBlackFactor = 0;
    private fadeToBlackDirection: FadeDirection = FadeDirection.FADE_OUT;
    public readonly renderer = new Renderer(this);
    public readonly mountainRiddle = new MountainRiddle();

    public override setup(): void {
        this.mapInfo = new MapInfo();
        this.gameTime = 0;
        this.fadeToBlackEndTime = 0;
        this.fadeToBlackStartTime = 0;
        this.fadeToBlackFactor = 0;
        this.apocalypse = false;
        this.fireFuryEndTime = 0;
        this.pettingCutscene = false;
        this.pettingCutsceneTime = 0;
        this.pettingEndingTriggered = false;
        this.windowCutscene = false;
        this.windowCutsceneTime = 0;
        this.windowEndingTriggered = false;
        Conversation.resetGlobals();
        this.gameObjects = [
            this.world = new World(this),
            this.particles,
            ...this.mapInfo.getEntities().map(entity => {
                return createEntity(entity.name, {
                    scene: this,
                    name: entity.name,
                    x: entity.x + entity.width / 2,
                    y: entity.y - entity.height,
                    width: entity.width,
                    height: entity.height,
                    ...entity.properties
                });
            })
        ];
        this.gameObjects.forEach(obj => obj.setup?.());

        this.player = this.getGameObject(Player);
        this.fire = this.getGameObject(Fire);
        this.stone = this.getGameObject(Stone);
        this.stoneDisciple = this.getGameObject(StoneDisciple);
        this.tree = this.getGameObject(Tree);
        this.flameboy = this.getGameObject(FlameBoy);
        this.wing = this.getGameObject(Wing);
        this.bird = this.getGameObject(Bird);
        this.shiba = this.getGameObject(Shiba);
        this.powerShiba = this.getGameObject(PowerShiba);
        this.shadowPresence = this.getGameObject(ShadowPresence);
        this.mimic = this.getGameObject(Mimic);
        this.caveman = this.getGameObject(Caveman);
        this.bone = this.getGameObject(Bone);
        this.exitPortal = this.getGameObject(ExitPortal);

        this.camera = new Camera(this, this.player);
        this.camera.setBounds(this.player.getCurrentCameraBounds());

        this.fpsInterval = window.setInterval(() => {
            this.framesPerSecond = this.frameCounter;
            this.frameCounter = 0;
        }, 1000);

        this.game.campaign.begin(this);

        if (this.game.campaign.isNewGamePlus) {
            this.initNewGamePlusState();
        }

        this.playBackgroundTrack(BgmId.CAVE);

        Conversation.setGlobal("devmode", isDev() + "");
        this.loadApocalypse();
    }

    private initNewGamePlusState(): void {
        this.game.campaign.runAction("talkedtofire");
        this.game.campaign.runAction("gotFireQuest");
        this.fire.conversation?.setState("reminder");
        this.player.enableRunning(true);
        this.player.enableDoubleJump(true);
        this.game.campaign.runAction("talkedtotree");
        this.player.enableMultiJump(true);
        this.tree.spawnSeed().bury();
        this.tree.conversation?.setState("reminder");
        this.stone.dropInWater();
    }

    public override cleanup(): void {
        if (this.fpsInterval != null) {
            window.clearInterval(this.fpsInterval);
        }
    }

    public addGameObject(object: GameObject): void {
        // Insert new item right before the player so player is always in front
        this.gameObjects.splice(this.gameObjects.indexOf(this.player) - 1, 0, object);
    }

    public removeGameObject(object: GameObject): void {
        const index = this.gameObjects.indexOf(object);

        if (index >= 0) {
            this.gameObjects.splice(index, 1);
        }
    }


    public setGateDisabled(type: Constructor<Gate>, disabled: boolean): void {
        const gate = this.gameObjects.find(isInstanceOf(type));
        if (!gate) {
            console.error(`cannot set disabled status of gate '${type.constructor.name}' because it does not exist`);
            return;
        }
        gate.disabled = disabled;
    }

    public getBackgroundTrack(id: BgmId): BackgroundTrack {
        const found = this.backgroundTracks.find(track => track.id === id);

        if (!found) {
            console.error(`Missing background track with ID '${id}'.`);

            return this.backgroundTracks[0];
        }

        return found;
    }

    public fadeActiveBackgroundTrack(fade: number, inverse = false): void {
        this.backgroundTracks.forEach(t => {
            if (t.active) {
                if (inverse) {
                    t.sound.setVolume(t.baseVolume * (1 - fade));
                } else {
                    t.sound.setVolume(t.baseVolume * fade);
                }
            }
        });
    }

    public setActiveBgmTrack(id: BgmId): void {
        this.backgroundTracks.forEach(t => { t.active = false; });
        const track = this.backgroundTracks.find(t => t.id === id);

        if (track) {
            track.active = true;

            if (!track.sound.isPlaying()) {
                track.sound.setLoop(true);
                track.sound.play();
            }
        }
    }

    public fadeToBackgroundTrack(id: BgmId): void {
        const track = this.getBackgroundTrack(id);
        this.muteMusic();
        this.backgroundTracks.forEach(t => { t.active = false; });
        track.active = true;
        track.sound.setVolume(track.baseVolume);

        if (!track.sound.isPlaying()) {
            track.sound.setLoop(true);
            track.sound.play();
        }
    }

    public playBackgroundTrack(id: BgmId): void {
        const track = this.getBackgroundTrack(id);
        this.backgroundTracks.forEach(t => t.sound.stop());
        track.active = true;
        track.sound.setVolume(track.baseVolume);
        track.sound.setLoop(true);
        track.sound.play();
    }

    private getGameObject<Args extends unknown[], GameObject>(type: new (...args: Args) => GameObject): GameObject {
        for (const gameObject of this.gameObjects) {
            if (gameObject instanceof type) {
                return gameObject;
            }
        }

        throw new Error(`Game object of type ${type.name} not found.`);
    }

    public override activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
        this.input.onButtonDown.connect(this.player.handleButtonDown, this.player);
        this.input.onButtonUp.connect(this.player.handleButtonUp, this.player);
        this.resume();
    }

    public override deactivate(): void {
        this.pause();
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
        this.input.onButtonDown.disconnect(this.player.handleButtonDown, this.player);
        this.input.onButtonUp.disconnect(this.player.handleButtonUp, this.player);
    }

    private async handleButtonDown(event: ControllerEvent): Promise<void> {
        if (event.isAbort || event.isPause) {
            if (this.player.getDance()) {
                this.player.getDance()?.resetMusic();
                this.player.cancelDance();
            }
        }

        if (event.isPause) {
            await this.scenes.pushScene(PauseScene, TitleScene);
        }
    }

    public async gameOver(): Promise<void> {
        GameScene.bgm1.stop();
        GameScene.bgm2.stop();
        GameScene.swell.setVolume(0.5);
        GameScene.swell.play();
        await sleep(2000);
        await this.game.scenes.setScene(EndScene);
    }

    public override isActive(): boolean {
        return !this.paused;
    }

    public override update(dt: number): void {
        if (this.paused) {
            dt = 0;
        }

        this.dt = dt;
        this.gameTime += dt;

        for (const obj of this.gameObjects) {
            obj.update(dt);
        }

        this.camera.update(dt, this.gameTime);

        if (this.fadeToBlackEndTime > this.gameTime) {
            let fade = (this.gameTime - this.fadeToBlackStartTime) / (this.fadeToBlackEndTime - this.fadeToBlackStartTime);

            if (this.fadeToBlackDirection === FadeDirection.FADE_IN) {
                fade = 1 - fade;
            }

            this.fadeToBlackFactor = fade;
        }

        if (this.friendshipCutscene) {
            this.updateFriendshipEndingCutscene(dt);
        }

        if (this.pettingCutscene) {
            this.updatePettingEndingCutscene(dt);
        }

        if (this.windowCutscene) {
            this.updateWindowEndingCutscene(dt);
        }
    }

    public override draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.save();

        // Center coordinate system
        ctx.translate(this.game.width / 2, this.game.height / 2);

        // Draw stuff
        this.camera.applyTransform(ctx);

        for (const obj of this.gameObjects) {
            obj.draw(ctx, width, height);
        }

        // Add all particle emitters to rendering queue
        this.particles.addEmittersToRenderingQueue();

        // Add all debug bounds to rendering queue
        this.addAllDebugBoundsToRenderingQueue();

        // Apocalypse
        if (this.fireFuryEndTime) {
            this.camera.setCinematicBar(1);
            // Fade out
            const diff = this.fireFuryEndTime - this.gameTime;
            const p = diff / 16;
            const fade = valueCurves.trapeze(0.4).get(p);
            this.drawFade(ctx, fade, "black");
        }

        if (this.apocalypse) {
            this.drawApocalypseOverlay(ctx);
        }

        // Gate Fade
        if (this.fadeToBlackFactor > 0) {
            this.fadeActiveBackgroundTrack(this.fadeToBlackFactor, true);
            this.drawFade(ctx, this.fadeToBlackFactor, "black");
        }

        // Cinematic bars
        this.camera.addCinematicBarsToRenderer();

        // Draw stuff from Rendering queue
        this.renderer.draw(ctx);

        ctx.restore();

        // Display FPS counter
        if (isDev()) {
            GameScene.font.drawText(
                ctx,
                `${this.framesPerSecond} FPS`,
                2, -1,
                "white"
            );
        }

        this.frameCounter++;
    }

    private addSingleDebugBoundsToRenderingQueue(bounds: Bounds, color: string): void {
        this.renderer.add({
            type: RenderingType.RECT,
            layer: RenderingLayer.DEBUG,
            position: {
                x: bounds.x,
                y: -bounds.y
            },
            lineColor: color,
            dimension: {
                width: bounds.width,
                height: bounds.height
            }
        });
    }

    private addAllDebugBoundsToRenderingQueue(): void {
        if (this.showBounds) {
            for (const obj of this.gameObjects) {
                if (obj instanceof Entity) {
                    if (obj instanceof Trigger) {
                        this.addSingleDebugBoundsToRenderingQueue(obj.getBounds(), "red");
                    } else if (obj instanceof CameraBounds) {
                        this.addSingleDebugBoundsToRenderingQueue(obj.getBounds(), "yellow");
                    } else if (obj instanceof Gate) {
                        this.addSingleDebugBoundsToRenderingQueue(obj.getBounds(), "green");
                    } else {
                        this.addSingleDebugBoundsToRenderingQueue(obj.getBounds(), "blue");
                    }
                }
            }
        }
    }

    public startApocalypseMusic(): void {
        this.playBackgroundTrack(BgmId.INFERNO);
    }

    public startFriendshipMusic(): void {
        this.playBackgroundTrack(BgmId.WINGS);
    }

    public muteMusic(): void {
        this.backgroundTracks.forEach(t => t.sound.setVolume(0));
    }

    public resetMusicVolumes(): void {
        this.backgroundTracks.forEach(t => {
            if (t.active) t.sound.setVolume(t.baseVolume);
        });
    }

    public async fadeToBlack(duration: number, direction: FadeDirection): Promise<void> {
        this.fadeToBlackStartTime = this.gameTime;
        this.fadeToBlackEndTime = this.gameTime + duration;
        this.fadeToBlackDirection = direction;
        await sleep(duration * 1000);
        if (direction === FadeDirection.FADE_OUT) {
            this.fadeToBlackFactor = 1;
        } else {
            this.fadeToBlackFactor = 0;
        }
    }

    private updateApocalypse(): void {
        this.fireEmitter.setPosition(this.player.x, this.player.y);
        this.fireEffects.forEach(e => e.update());

        if (timedRnd(this.dt, 0.8)) {
            this.fireEmitter.emit();
        }

        this.fire.growthTarget = Math.max(2, 20 - 6 * this.gameObjects.filter(
            o => o instanceof Cloud && o.isRaining()
        ).length);

        if (this.fire.intensity < 6) {
            this.fire.intensity = Math.max(this.fire.intensity, 4);
            this.apocalypseFactor = clamp((this.fire.intensity - 4) / 2, 0, 1);

            if (this.apocalypseFactor <= 0.001) {
                // End apocalypse
                this.apocalypseFactor = 0;
                this.apocalypse = false;
                this.fire.state = FireState.PUT_OUT;

                this.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.BEAT_FIRE);
                this.game.campaign.runAction("enable", null, [ "fire", "fire3" ]);

                // Music
                GameScene.bgm2.stop();
            }
        }
    }

    private updateFriendshipEndingCutscene(dt: number): void {
        this.camera.setCinematicBar(1);
    }

    private updateWindowEndingCutscene(dt: number): void {
        this.windowCutsceneTime += dt;
        if (!this.windowEndingTriggered && this.windowCutsceneTime > WINDOW_ENDING_CUTSCENE_DURATION + WINDOW_ENDING_FADE_DURATION) {
            this.windowEndingTriggered = true;
            this.game.campaign.getQuest(QuestKey.E).finish();
            void this.gameOver();
        }

        this.windowEndingTexts.forEach((t, index) => {
            if (this.windowCutsceneTime / WINDOW_ENDING_CUTSCENE_DURATION > t.enter) {
                const fadeTime = 0.5;
                const enterTime = WINDOW_ENDING_CUTSCENE_DURATION * t.enter;
                const alpha = Math.max(0, Math.min(1, (this.windowCutsceneTime - enterTime) / fadeTime));
                const measure = GameScene.font.measureText(t.label);
                this.renderer.add({
                    type: RenderingType.TEXT, layer: RenderingLayer.UI, textColor: "white", relativeToScreen: true, alpha,
                    text: t.label, position: {
                        x: (GAME_CANVAS_WIDTH / 2) - (measure.width / 2),
                        y: measure.height * index + (index * 3) + 50
                    }, asset: GameScene.font,
                });
            }
        });
    }

    private updatePettingEndingCutscene(dt: number): void {
        this.pettingCutsceneTime += dt;
        if (!this.pettingEndingTriggered && this.pettingCutsceneTime > PETTING_ENDING_CUTSCENE_DURATION + PETTING_ENDING_FADE_DURATION) {
            this.pettingEndingTriggered = true;
            this.game.campaign.getQuest(QuestKey.D).finish();
            void this.gameOver();
        }

        this.petEndingTexts.forEach((t, index) => {
            if (this.pettingCutsceneTime / PETTING_ENDING_CUTSCENE_DURATION > t.enter) {
                const fadeTime = 0.5;
                const enterTime = PETTING_ENDING_CUTSCENE_DURATION * t.enter;
                const yOffset = Math.pow((this.pettingCutsceneTime - enterTime) / 2, 2) * -1;
                const alpha = Math.max(0, Math.min(1, (this.pettingCutsceneTime - enterTime) / fadeTime));
                const measure = GameScene.font.measureText(t.label);
                this.renderer.add({
                    type: RenderingType.TEXT, layer: RenderingLayer.UI, textColor: "white", relativeToScreen: true, alpha,
                    text: t.label, position: {
                        x: (GAME_CANVAS_WIDTH / 2) - (measure.width / 2),
                        //y: measure.height * index + (index * 3) + 20
                        y: 100 + yOffset
                    }, asset: GameScene.font,
                });
            }
        });
    }

    private drawApocalypseOverlay(ctx: CanvasRenderingContext2D): void {
        this.updateApocalypse();
        this.camera.setCinematicBar(this.apocalypseFactor);

        this.renderer.add({
            type: RenderingType.RECT,
            layer: RenderingLayer.FULLSCREEN_FX,
            position: { x: 0, y: 0 },
            fillColor: "darkred",
            globalCompositeOperation: "color",
            alpha: 0.7 * this.apocalypseFactor,
            relativeToScreen: true,
            dimension: { width: this.game.width, height: this.game.height }
        });
    }

    private drawFade(ctx: CanvasRenderingContext2D, alpha: number, color = "black"): void {
        this.renderer.add({
            type: RenderingType.RECT,
            layer: RenderingLayer.FULLSCREEN_FX,
            position: { x: 0, y: 0 },
            fillColor: color,
            alpha,
            relativeToScreen: true,
            dimension: { width: this.game.width, height: this.game.height }
        });
    }

    public loadApocalypse(): void {
        this.fireEffects = [1, 2].map(num =>  new FireGfx(32, 24, true, 2));

        this.fireEmitter = this.particles.createEmitter({
            position: {x: this.player.x, y: this.player.y},
            offset: () => ({x: rnd(-1, 1) * 300, y: 200}),
            velocity: () => ({ x: 0, y: -25}),
            color: () => rndItem(this.fireEffects).getImage(),
            size: () => rnd(16, 32),
            gravity: {x: -10, y: -30},
            lifetime: () => rnd(5, 15),
            alpha: 1,
            breakFactor: 0.9,
            alphaCurve: valueCurves.cos(0.2, 0.1),
            update: particle => {
                if (
                    this.world.collidesWith(particle.x, particle.y - particle.size / 4)
                ) {
                    particle.vx = 0;
                    particle.vy = 0;
                }
            }
        });
    }

    public beginWindowEnding(): void {
        this.windowCutscene = true;
        this.player.setControllable(false);
        this.fadeToBlackDirection = FadeDirection.FADE_OUT;
        this.fadeToBlackStartTime = this.gameTime + WINDOW_ENDING_CUTSCENE_DURATION;
        this.fadeToBlackEndTime = this.fadeToBlackStartTime + (WINDOW_ENDING_FADE_DURATION);
        const target = this.gameObjects.find(isInstanceOf(WindowZoomTarget));
        if (target) {
            void this.camera.focusOn(WINDOW_ENDING_CUTSCENE_DURATION + PETTING_ENDING_FADE_DURATION, target.x, this.camera.y, 1, 0, valueCurves.cubic);
        }
    }

    public beginPetEnding(): void {
        this.pettingCutscene = true;
        this.player.startPettingDog();
        this.shiba.startBeingPetted();
        this.fadeToBlackDirection = FadeDirection.FADE_OUT;
        this.fadeToBlackStartTime = this.gameTime + PETTING_ENDING_CUTSCENE_DURATION;
        this.fadeToBlackEndTime = this.fadeToBlackStartTime + (PETTING_ENDING_FADE_DURATION);
        this.playBackgroundTrack(BgmId.ECSTASY);
    }

    public cancelPatEnding(): void {
        if (this.canCancelPatEnding()) {
            this.pettingCutscene = false;
            this.pettingCutsceneTime = 0;
            this.player.stopPettingDog();
            this.shiba.stopBeingPetted();
            this.fadeToBlackEndTime = 0;
            this.fadeToBlackStartTime = 0;
            this.fadeToBlackFactor = 0;
            this.playBackgroundTrack(BgmId.OVERWORLD);
        }
    }

    private canCancelPatEnding(): boolean {
        return this.pettingCutsceneTime < PETTING_ENDING_CUTSCENE_DURATION + PETTING_ENDING_FADE_DURATION;
    }

    public beginFriendshipEnding(): void {
        this.friendshipCutscene = true;
        this.shiba.setState(ShibaState.ON_MOUNTAIN);
        this.shiba.nextState();

        const playerTargetPos = this.gameObjects.find(isInstanceOf(FriendshipPlayerPosition));

        if (!playerTargetPos) {
            throw new Error("cannot initiate friendship ending because some points of interest are missing");
        }

        this.player.startAutoMove(playerTargetPos.x, true);
        this.player.setControllable(false);
    }

    public async beginApocalypse(): Promise<void> {
        this.apocalypse = true;
        this.world.stopRain();

        const bossPosition = this.gameObjects.find(isInstanceOf(BossSpawn));
        const cloudPositions = this.gameObjects.filter(isInstanceOf(BossCloud));

        if (bossPosition && cloudPositions.length > 0) {
            cloudPositions.forEach(pos => {
                const cloud = new Cloud({
                    scene: this,
                    x: pos.x,
                    y: pos.y,
                    canRain: true
                });
                this.gameObjects.push(cloud);
            });

            // Teleport player and fire to boss spawn position
            this.player.x = bossPosition.x - 36;
            this.player.y = bossPosition.y;

            this.player.removePowerUps();
            this.player.enableRainDance();
            this.fire.x = bossPosition.x;
            this.fire.y = bossPosition.y;

            this.camera.setBounds(this.player.getCurrentCameraBounds());

            // Some helpful thoughts
            await sleep(9000);
            await this.player.think("This is not over…", 2000);
            await sleep(1000);
            await this.player.think("There's still something I can do.", 4000);
        } else {
            throw new Error("Cannot begin apocalypse because boss_spawn or bosscloud trigger is missing in map.");
        }
    }

    private togglePause(paused = !this.paused): void {
        this.paused = paused;
    }

    public pause(): void {
        this.muteMusic();
        MenuList.pause.stop();
        MenuList.pause.play();
        this.togglePause(true);
    }

    public resume(): void {
        this.resetMusicVolumes();
        this.togglePause(false);
    }

    public setBgmVolume(volume: 0): void {
        GameScene.bgm1.setVolume(volume);
        GameScene.bgm2.setVolume(volume);
    }
}
