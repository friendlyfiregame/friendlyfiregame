import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { Camera } from "../Camera";
import { World } from "../World";
import { MapInfo } from "../MapInfo";
import { createEntity } from "../Entity";
import { Player } from "../Player";
import { Fire } from "../Fire";
import { Stone } from "../Stone";
import { Tree } from "../Tree";
import { FlameBoy } from "../FlameBoy";
import { Wing } from "../Wing";
import { Spider } from "../Spider";
import { Conversation } from "../Conversation";
import { Particles, ParticleEmitter, particles, valueCurves } from "../Particles";
import { Seed } from "../Seed";
import { FireGfx } from "../FireGfx";
import { Cloud } from "../Cloud";
import { asset } from "../Assets";
import { rnd, rndItem, clamp, timedRnd, boundsFromMapObject, isDev } from "../util";
import { BitmapFont } from "../BitmapFont";
import { PauseScene } from "./PauseScene";
import { MapObjectJSON } from '*/level.json';
import { ControllerEvent } from "../input/ControllerEvent";
import { Caveman } from '../Caveman';
import { Campfire } from '../Campfire';
import { QuestATrigger, QuestKey } from '../Quests';
import { EndScene } from './EndScene';
import { Sound } from '../Sound';

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

export class GameScene extends Scene<FriendlyFire> {
    @asset("fonts/standard.font.json")
    private static font: BitmapFont;

    @asset("sounds/ending/swell.mp3")
    private static swell: Sound;

    /* Total game time (time passed while game not paused) */
    public gameTime = 0;

    public gameObjects: GameObject[] = [];
    public pointsOfInterest: MapObjectJSON[] = [];
    public triggerObjects: MapObjectJSON[] = [];
    public paused = false;
    public world!: World;
    public camera!: Camera;
    public player!: Player;
    public stone!: Stone;
    public tree!: Tree;
    public seed!: Seed;
    public flameboy!: FlameBoy;
    public wing!: Wing;
    public spider!: Spider;
    public caveman!: Caveman;
    public campfire!: Campfire;
    // public campaign!: Campaign;
    public particles!: Particles;
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

    public setup(): void {
        this.mapInfo = new MapInfo();
        // this.campaign = new Campaign(this);
        this.particles = particles;
        this.pointsOfInterest = this.mapInfo.getPointers();
        this.triggerObjects = this.mapInfo.getTriggerObjects();
        this.gameObjects = [
            this.world = new World(this),
            particles,
            ...this.mapInfo.getGameObjectInfos().map(entity => createEntity(entity.name, this, entity.x, entity.y, entity.properties))
        ];
        this.player = this.getGameObject(Player);
        this.fire = this.getGameObject(Fire);
        this.stone = this.getGameObject(Stone);
        this.tree = this.getGameObject(Tree);
        this.flameboy = this.getGameObject(FlameBoy);
        this.wing = this.getGameObject(Wing);
        this.spider = this.getGameObject(Spider);
        this.caveman = this.getGameObject(Caveman);
        this.campfire = this.getGameObject(Campfire);

        this.camera = new Camera(this, this.player);
        this.fpsInterval = setInterval(() => {
            this.framesPerSecond = this.frameCounter;
            this.frameCounter = 0;
        }, 1000);

        this.game.campaign.begin(this);

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
        this.resume();
    }

    public deactivate(): void {
        this.pause();
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
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

    public gameOver() {
        FriendlyFire.music[0].setVolume(0);
        FriendlyFire.music[1].setVolume(0);
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

        if (this.showBounds) {
            // Draw trigger bounds for collisions
            for (const obj of this.triggerObjects) {
                const bounds = boundsFromMapObject(obj);
                ctx.strokeStyle = "blue";
                ctx.strokeRect(bounds.x, -bounds.y, bounds.width, bounds.height);
            }
        }

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
        // Cinematic bars
        this.camera.renderCinematicBars(ctx);

        ctx.restore();

        // Display FPS counter
        if (isDev()) {
            GameScene.font.drawText(ctx, `${this.framesPerSecond} FPS`, 2 * this.scale, 2 * this.scale, "white");
        }
        this.frameCounter++;
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
            FriendlyFire.music[1].setVolume(0.25 * this.apocalypseFactor);
            if (this.apocalypseFactor <= 0.001) {
                // End apocalypse
                this.apocalypseFactor = 0;
                this.apocalypse = false;
                this.fire.angry = false;
                this.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.BEAT_FIRE);
                this.game.campaign.runAction("enable", null, [ "fire", "fire3" ]);
                // Music
                FriendlyFire.music[1].stop()
            }
        }
    }

    private drawApocalypseOverlay(ctx: CanvasRenderingContext2D) {
        this.updateApocalypse();
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.camera.setCinematicBar(this.apocalypseFactor);
        // Red overlay
        ctx.fillStyle = "darkred";
        ctx.globalCompositeOperation = "color";
        ctx.globalAlpha = 0.7 * this.apocalypseFactor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }

    private drawFade(ctx: CanvasRenderingContext2D, alpha: number, color = "black") {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }

    public loadApocalypse() {
        this.fireEffects = [1, 2].map(num =>  new FireGfx(32, 24, true, 2));
        this.fireEmitter = particles.createEmitter({
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

        const cloudPositions = this.pointsOfInterest.filter(poi => poi.name === 'bosscloud');
        cloudPositions.forEach(pos => {
            const cloud = new Cloud(this, pos.x, pos.y, {
                velocity: 0,
                distance: 1
            }, true);
            this.gameObjects.push(cloud);
        })

        this.player.enableMultiJump();

        // Some helpful thoughts
        setTimeout(() => this.player.think("This is not over...", 2000), 9000);
        setTimeout(() => this.player.think("There's still something I can do", 4000), 12000);
    }

    private togglePause(paused = !this.paused) {
        this.paused = paused;
    }

    public pause() {
        this.togglePause(true);
    }

    public resume() {
        this.togglePause(false);
    }
}
