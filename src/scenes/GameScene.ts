import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { Camera } from "../Camera";
import { World } from "../World";
import { MapInfo, GameObjectInfo } from "../MapInfo";
import { createEntity, Bounds } from "../Entity";
import { Player } from "../Player";
import { Fire } from "../Fire";
import { Stone } from "../Stone";
import { Tree } from "../Tree";
import { FlameBoy } from "../FlameBoy";
import { Wing } from "../Wing";
import { Spider } from "../Spider";
import { Conversation } from "../Conversation";
import { Particles, ParticleEmitter, valueCurves } from "../Particles";
import { Seed } from "../Seed";
import { FireGfx } from "../FireGfx";
import { Cloud } from "../Cloud";
import { asset } from "../Assets";
import { rnd, rndItem, clamp, timedRnd, boundsFromMapObject, isDev } from "../util";
import { BitmapFont } from "../BitmapFont";
import { PauseScene } from "./PauseScene";
import { ControllerEvent } from "../input/ControllerEvent";
import { Caveman } from '../Caveman';
import { QuestATrigger, QuestKey } from '../Quests';
import { EndScene } from './EndScene';
import { Sound } from '../Sound';
import { MenuList } from '../Menu';
import { ShadowPresence } from '../ShadowPresence';
import { StoneDisciple } from '../StoneDisciple';
import { Bird } from '../Bird';
import { MountainRiddle } from '../MountainRiddle';
import { RiddleStone } from '../RiddleStone';
import { Campfire } from '../Campfire';
import { MovingPlatform } from '../MovingPlatform';
import { Skull } from '../Skull';
import { Table } from '../Table';
import { SuperThrow } from '../SuperThrow';
import { Portal } from '../Portal';
import { DIALOG_FONT } from "../constants";
import { Mimic } from '../Mimic';
import { Renderer, RenderingType, RenderingLayer } from '../Renderer';

export enum FadeDirection { FADE_IN, FADE_OUT }

export interface GameObject {
    draw(ctx: CanvasRenderingContext2D, width: number, height: number): void;
    update(dt: number): void;
}

export interface CollidableGameObject extends GameObject {
    collidesWith(x: number, y: number): number;
}

export function isCollidableGameObject(object: GameObject): object is CollidableGameObject  {
    return typeof (object as CollidableGameObject).collidesWith === "function";
}

export enum BgmId {
    OVERWORLD = 'overworld',
    INFERNO = 'inferno',
    CAVE = 'cave',
    RIDDLE = 'riddle'
}

export type BackgroundTrack = {
    active: boolean;
    id: BgmId;
    sound: Sound,
    baseVolume: number;
}

export class GameScene extends Scene<FriendlyFire> {
    @asset("music/theme_01.ogg")
    public static bgm1: Sound;

    @asset("music/inferno.ogg")
    public static bgm2: Sound;

    @asset("music/cave.ogg")
    public static bgmCave: Sound;

    @asset("music/riddle.ogg")
    public static bgmRiddle: Sound;

    private backgroundTracks: BackgroundTrack[] = [
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
            baseVolume: 0.15
        },
        {
            active: false,
            id: BgmId.RIDDLE,
            sound: GameScene.bgmRiddle,
            baseVolume: 1
        },
    ]

    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    @asset("sounds/ending/swell.mp3")
    private static swell: Sound;

    @asset("sounds/gate/wrong.ogg")
    public static wrong: Sound;

    /* Total game time (time passed while game not paused) */
    public gameTime = 0;

    public gameObjects: GameObject[] = [];
    public pointsOfInterest: GameObjectInfo[] = [];
    public triggerObjects: GameObjectInfo[] = [];
    public boundObjects: GameObjectInfo[] = [];
    public gateObjects: GameObjectInfo[] = [];
    public paused = false;
    public world!: World;
    public camera!: Camera;
    public player!: Player;
    public stone!: Stone;
    public stoneDisciple!: StoneDisciple;
    public tree!: Tree;
    public seed!: Seed;
    public flameboy!: FlameBoy;
    public wing!: Wing;
    public bird!: Bird;
    public spider!: Spider;
    public mimic!: Mimic;
    public shadowPresence!: ShadowPresence;
    public caveman!: Caveman;
    public particles = new Particles(this);
    public fire!: Fire;
    public fireFuryEndTime = 0;
    public apocalypse = false;
    private apocalypseFactor = 1;
    private fireEffects: FireGfx[] = [];
    private fireEmitter!: ParticleEmitter;
    private frameCounter = 0;
    private framesPerSecond = 0;
    public showBounds = false;
    private scale = 1;
    private mapInfo!: MapInfo;
    public dt: number = 0;
    private fpsInterval: any = null;
    private fadeToBlackEndTime = 0;
    private fadeToBlackStartTime = 0;
    private fadeToBlackFactor = 0;
    private faceToBlackDirection: FadeDirection = FadeDirection.FADE_OUT;
    public readonly renderer = new Renderer(this);
    public readonly mountainRiddle = new MountainRiddle();
    public setup(): void {

        this.mapInfo = new MapInfo();
        this.pointsOfInterest = this.mapInfo.getPointers();
        this.triggerObjects = this.mapInfo.getTriggerObjects();
        this.boundObjects = this.mapInfo.getBoundObjects();
        this.gateObjects = this.mapInfo.getGateObjects();

        this.gameTime = 0;
        this.apocalypse = false;
        this.fireFuryEndTime = 0;

        this.gameObjects = [
            this.world = new World(this),
            this.particles,
            ...this.mapInfo.getEntities().map(entity => {
                switch (entity.name) {
                    case 'riddlestone': return new RiddleStone(this, entity.x, entity.y, entity.properties);
                    case 'campfire': return new Campfire(this, entity.x, entity.y);
                    case 'movingplatform': return new MovingPlatform(this, entity.x, entity.y, entity.properties);
                    case 'skull': return new Skull(this, entity.x, entity.y);
                    case 'table': return new Table(this, entity.x, entity.y);
                    case 'superthrow': return new SuperThrow(this, entity.x, entity.y);
                    case 'portal': return new Portal(this, entity.x, entity.y);
                    default: return createEntity(entity.name, this, entity.x, entity.y, entity.properties);
                }
            })
        ];
        this.player = this.getGameObject(Player);
        this.fire = this.getGameObject(Fire);
        this.stone = this.getGameObject(Stone);
        this.stoneDisciple = this.getGameObject(StoneDisciple);
        this.tree = this.getGameObject(Tree);
        this.flameboy = this.getGameObject(FlameBoy);
        this.wing = this.getGameObject(Wing);
        this.bird = this.getGameObject(Bird);
        this.shadowPresence = this.getGameObject(ShadowPresence);
        this.spider = this.getGameObject(Spider);
        this.mimic = this.getGameObject(Mimic);
        this.caveman = this.getGameObject(Caveman);

        this.camera = new Camera(this, this.player);
        this.camera.setBounds(this.player.getCurrentMapBounds());

        this.fpsInterval = setInterval(() => {
            this.framesPerSecond = this.frameCounter;
            this.frameCounter = 0;
        }, 1000);

        this.game.campaign.begin(this);

        this.playBackgroundTrack(BgmId.CAVE);

        Conversation.setGlobal("devmode", isDev() + "");
        this.loadApocalypse();
    }

    public cleanup() {
        if (this.fpsInterval != null) {
            clearInterval(this.fpsInterval);
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

    public getBackgroundTrack (id: BgmId): BackgroundTrack {
        const found = this.backgroundTracks.find(track => track.id === id);
        if (!found) {
            console.error(`Missing background track with id '${id}'`);
            return this.backgroundTracks[0];
        }
        return found;
    }

    public fadeActiveBackgroundTrack (fade: number, inverse = false): void {
        this.backgroundTracks.forEach(t => {
            if (t.active) {
                if (inverse) {
                    t.sound.setVolume(t.baseVolume * (1 - fade))
                } else {
                    t.sound.setVolume(t.baseVolume * fade)
                }
            }
        });
    }

    public setActiveBgmTrack (id: BgmId): void {
        this.backgroundTracks.forEach(t => t.active = false);
        const track = this.backgroundTracks.find(t => t.id === id);
        if (track) {
            track.active = true;
            if (!track.sound.isPlaying()) {
                track.sound.setLoop(true);
                track.sound.play();
            }
        }
    }

    public fadeToBackgroundTrack (id: BgmId): void {
        const track = this.getBackgroundTrack(id);
        this.muteMusic();
        this.backgroundTracks.forEach(t => t.active = false);
        track.active = true;
        track.sound.setVolume(track.baseVolume);
        if (!track.sound.isPlaying()) {
            track.sound.setLoop(true);
            track.sound.play();
        }
    }

    public playBackgroundTrack (id: BgmId): void {
        const track = this.getBackgroundTrack(id);
        this.backgroundTracks.forEach(t => t.sound.stop());
        track.active = true;
        track.sound.setVolume(track.baseVolume);
        track.sound.setLoop(true);
        track.sound.play();
    }

    private getGameObject<T>(type: new (...args: any[]) => T): T {
        for (const gameObject of this.gameObjects) {
            if (gameObject instanceof type) {
                return gameObject;
            }
        }
        throw new Error(`Game object of type ${type.name} not found`);
    }

    public activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
        this.input.onButtonDown.connect(this.player.handleButtonDown, this.player);
        this.input.onButtonUp.connect(this.player.handleButtonUp, this.player);
        this.resume();
    }

    public deactivate(): void {
        this.pause();
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
        this.input.onButtonDown.disconnect(this.player.handleButtonDown, this.player);
        this.input.onButtonUp.disconnect(this.player.handleButtonUp, this.player);
    }

    private handleButtonDown(event: ControllerEvent): void {
        if (event.isAbort || event.isPause) {
            if (this.player.getDance()) {
                this.player.getDance()?.resetMusic();
                this.player.cancelDance();
            }
        }
        if (event.isPause) {
            this.scenes.pushScene(PauseScene);
        }
    }

    public gameOver(questKey?: QuestKey) {
        GameScene.bgm1.stop();
        GameScene.bgm2.stop();
        GameScene.swell.setVolume(0.5);
        GameScene.swell.play();

        setTimeout(() => {
            this.game.scenes.setScene(EndScene);
        }, 2000);
    }

    public isActive(): boolean {
        return !this.paused;
    }

    public update(dt: number) {
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
            if (this.faceToBlackDirection === FadeDirection.FADE_IN) {
                fade = 1 - fade;
            }
            this.fadeToBlackFactor = fade;
        }
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();

        // Center coordinate system
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

        // Scale by three because everything was based on 480x300 canvas and now its three times larger
        ctx.scale(this.scale, this.scale);

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
            GameScene.font.drawText(ctx, `${this.framesPerSecond} FPS`, 2 * this.scale, 2 * this.scale, "white");
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
        })
    }

    private addAllDebugBoundsToRenderingQueue(): void {
        if (this.showBounds) {
            // Draw trigger bounds for collisions
            for (const obj of this.triggerObjects) {
                const bounds = boundsFromMapObject(obj);
                this.addSingleDebugBoundsToRenderingQueue(bounds, "blue");
            }
            for (const obj of this.boundObjects) {
                const bounds = boundsFromMapObject(obj);
                this.addSingleDebugBoundsToRenderingQueue(bounds, "yellow");
            }
            for (const obj of this.gateObjects) {
                const bounds = boundsFromMapObject(obj);
                this.addSingleDebugBoundsToRenderingQueue(bounds, "green");
            }
        }
    }

    public startApocalypseMusic(): void {
        this.playBackgroundTrack(BgmId.INFERNO);
    }

    public muteMusic(): void {
        this.backgroundTracks.forEach(t => t.sound.setVolume(0));
    }

    public resetMusicVolumes(): void {
        this.backgroundTracks.forEach(t => {
            if (t.active) t.sound.setVolume(t.baseVolume);
        });
    }

    public fadeToBlack(duration: number, direction: FadeDirection): Promise<void> {
        return new Promise((resolve) => {
            this.fadeToBlackStartTime = this.gameTime;
            this.fadeToBlackEndTime = this.gameTime + duration;
            this.faceToBlackDirection = direction;
            setTimeout(() => {
                if (direction === FadeDirection.FADE_OUT) {
                    this.fadeToBlackFactor = 1;
                } else {
                    this.fadeToBlackFactor = 0;
                }
                resolve();
            }, duration * 1000);
        });
    }

    private updateApocalypse() {
        this.fireEmitter.setPosition(this.player.x, this.player.y);
        this.fireEffects.forEach(e => e.update(this.dt));
        if (timedRnd(this.dt, 0.8)) {
            this.fireEmitter.emit();
        }
        this.fire.growthTarget = Math.max(2, 20 - 6 * this.gameObjects.filter(
                o => o instanceof Cloud && o.isRaining()).length);
        if (this.fire.intensity < 6) {
            this.fire.intensity = Math.max(this.fire.intensity, 4);
            this.apocalypseFactor = clamp((this.fire.intensity - 4) / 2, 0, 1);
            // GameScene.bgm2.setVolume(this.bgm2BaseVolume * this.apocalypseFactor);
            if (this.apocalypseFactor <= 0.001) {
                // End apocalypse
                this.apocalypseFactor = 0;
                this.apocalypse = false;
                this.fire.angry = false;
                this.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.BEAT_FIRE);
                this.game.campaign.runAction("enable", null, [ "fire", "fire3" ]);
                // Music
                GameScene.bgm2.stop()
            }
        }
    }

    private drawApocalypseOverlay(ctx: CanvasRenderingContext2D) {
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
            dimension: { width: ctx.canvas.width, height: ctx.canvas.height }
        })
    }

    private drawFade(ctx: CanvasRenderingContext2D, alpha: number, color = "black") {
        this.renderer.add({
            type: RenderingType.RECT,
            layer: RenderingLayer.FULLSCREEN_FX,
            position: { x: 0, y: 0 },
            fillColor: color,
            alpha,
            relativeToScreen: true,
            dimension: { width: ctx.canvas.width, height: ctx.canvas.height }
        })
    }

    public loadApocalypse() {
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
                if (this.world.collidesWith(particle.x, particle.y - particle.size / 4)) {
                    particle.vx = 0;
                    particle.vy = 0;
                }
            }
        });
    }

    public beginApocalypse() {
        this.apocalypse = true;
        this.world.stopRain();

        const bossPosition = this.pointsOfInterest.find(poi => poi.name === 'boss_spawn');
        const cloudPositions = this.pointsOfInterest.filter(poi => poi.name === 'bosscloud');

        if (bossPosition && cloudPositions.length > 0) {
            cloudPositions.forEach(pos => {
                const cloud = new Cloud(this, pos.x, pos.y, {
                    velocity: 0,
                    distance: 1
                }, true);
                this.gameObjects.push(cloud);
            })

            // Teleport player and fire to boss spawn position
            this.player.x = bossPosition.x - 36;
            this.player.y = bossPosition.y;
            this.player.removePowerUps();
            this.player.enableRainDance();
            this.fire.x = bossPosition.x;
            this.fire.y = bossPosition.y;
            this.camera.setBounds(this.player.getCurrentMapBounds())

            // this.player.enableMultiJump();

            // Some helpful thoughts
            setTimeout(() => this.player.think("This is not over…", 2000), 9000);
            setTimeout(() => this.player.think("There's still something I can do", 4000), 12000);
        } else {
            throw new Error('cannot begin apocalypse because. boss_spawn or bosscloud trigger in map missing');
        }
    }

    private togglePause(paused = !this.paused) {
        this.paused = paused;
    }

    public pause() {
        this.muteMusic();
        MenuList.pause.stop();
        MenuList.pause.play();
        this.togglePause(true);
    }

    public resume() {
        this.resetMusicVolumes()
        this.togglePause(false);
    }
}
