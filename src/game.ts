import { World } from "./World";
import { Player } from "./Player";
import { particles, Particles, ParticleEmitter, valueCurves } from './Particles';
import { Fire } from './Fire';
import { clamp, now, rndItem, rnd, timedRnd } from './util';
import { Face } from './Face';
import { Camera } from './Camera';
import { FireGfx } from './FireGfx';
import { MapInfo } from "./MapInfo";
import { createEntity } from "./Entity";
import { Campaign } from './Campaign';
import "./Cloud";
import "./Stone";
import "./FlameBoy";
import "./Tree";
import "./Seed";
import "./Wing";
import "./Spider";
import { BitmapFont } from "./BitmapFont";
import { Sound } from "./Sound";
import { Stone } from "./Stone";
import { Dance } from './Dance';
import { Tree } from "./Tree";
import { GamepadInput } from "./GamepadInput";
import { FlameBoy } from './FlameBoy';
import { Wing } from './Wing';
import { Spider } from './Spider';
import { loadImage } from "./graphics";
import { KeyHandler } from "./KeyHandler";
import { Seed } from './Seed';
import { Cloud } from './Cloud';
import { Sprites, getSpriteIndex } from './Sprites';
import { FLAMEBOY_ANIMATION } from './constants';
import { Conversation } from './Conversation';
import { DialoguePrompt } from './DialoguePrompt';

export const gameWidth = 480;
export const gameHeight = 270;

const credits = "Friendly Fire is a contribution to Ludum Dare Game Jam Contest #46. " +
    "Created by Eduard But, Nico Huelscher, Benjamin Jung, Nils Kreutzer, Bastian Lang, Ranjit Mevius, Markus Over, " +
    "Klaus Reimer and Jennifer van Veen, within 72 hours.";

export interface GameObject {
    draw(ctx: CanvasRenderingContext2D): void;
    update(dt: number): void;
    load(): Promise<void>;
}

export interface CollidableGameObject extends GameObject {
    collidesWith(x: number, y: number): number;
}

export function isCollidableGameObject(object: GameObject): object is CollidableGameObject  {
    return typeof (object as CollidableGameObject).collidesWith === "function";
}

// Max time delta (in s). If game freezes for a few seconds for whatever reason, we don't want updates to jump too much.
const MAX_DT = 0.1;

export enum GameStage {
    TITLE,
    MAIN,
    END
}

export class Game {
    public dev = window.location.port === "8000";

    public canvas: HTMLCanvasElement;

    private lastUpdateTime = now();

    /* Time delta in game logic time (0 while game is paused, elapsed seconds since last frame otherwise) */
    public dt = 0;

    /* Total game time (time passed while game not paused) */
    public gameTime = 0;

    /* Time delta since last frame */
    public appDt = 0;

    /* Total time elapsed since starting the game */
    public appTime = 0;

    private boundLoop: () => void;

    public gameObjects: GameObject[] = [];

    private paused = false;

    public world: World;

    public camera: Camera;

    public player: Player;
    public stone: Stone;
    public tree: Tree;
    public seed!: Seed;
    public flameboy: FlameBoy;
    public wing: Wing;
    public spider: Spider;

    public campaign: Campaign;

    public particles: Particles;

    public fire: Fire;
    public fireFuryEndTime = 0;

    public apocalypse = false;
    private apocalypseFactor = 1;
    private fireEffects: FireGfx[] = [];
    private fireEmitter!: ParticleEmitter;

    private frameCounter = 0;
    private framesPerSecond = 0;
    private useRealResolution = false;
    private scalePixelPerfect = true;
    private scale = 1;
    private readonly mapInfo: MapInfo;

    public mainFont!: BitmapFont;
    public bigFont!: BitmapFont;
    public music!: Sound[];

    public gamepadInput!: GamepadInput;

    private titleImage!: HTMLImageElement;
    private endImage!: HTMLImageElement;
    private endBoy!: Sprites;
    private endBoySpriteIndex = 0;
    public stage = GameStage.TITLE;
    public keyHandler = new KeyHandler();

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.updateCanvasSize();
        window.addEventListener("resize", () => this.updateCanvasSize());
        this.mapInfo = new MapInfo();
        this.boundLoop = this.loop.bind(this);
        this.campaign = new Campaign(this);
        this.particles = particles;
        this.gameObjects = [
            this.world = new World(this),
            particles,
            ...this.mapInfo.getGameObjectInfos().map(npc => createEntity(npc.name, this, npc.x, npc.y, npc.properties))
        ];
        this.player = this.getGameObject(Player);
        this.fire = this.getGameObject(Fire);
        this.stone = this.getGameObject(Stone);
        this.tree = this.getGameObject(Tree);
        this.flameboy = this.getGameObject(FlameBoy);
        this.wing = this.getGameObject(Wing);
        this.spider = this.getGameObject(Spider);

        this.camera = new Camera(this, this.player);
        setInterval(() => {
            this.framesPerSecond = this.frameCounter;
            this.frameCounter = 0;
        }, 1000);

        this.gamepadInput = new GamepadInput();

        Conversation.setGlobal("devmode", this.dev + "");
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

    private async load() {
        this.music = [
            new Sound("music/theme_01.mp3"),
            new Sound("music/inferno.mp3")
        ];
        await this.loadFonts();
        this.titleImage = await loadImage("images/title.png");
        this.endImage = await loadImage("images/end.png");
        this.endBoy = new Sprites(await loadImage("sprites/flameboy2.png"), 6, 1);
        await Face.load();
        await Dance.load();
        await FireGfx.load();
        await DialoguePrompt.load();
        for (const obj of this.gameObjects) {
            await obj.load();
        }
        await this.loadApocalypse();
        // setTimeout(() => this.beginApocalypse(), 1000);
    }

    public toggleScalingMethod () {
        this.scalePixelPerfect = !this.scalePixelPerfect;
        this.updateCanvasSize();
    }

    private async playMusicTrack(): Promise<void> {
        const music = this.music[0];
        this.music.forEach(music => music.stop());
        music.setLoop(true);
        music.setVolume(0.25);
        this.music[1].setVolume(0.25);
        return music.play();
    };

    private async loadFonts() {
        this.mainFont = await BitmapFont.load("fonts/fontsheet.png", {
            "white": "white", "black": "black", "gray": "gray", "darkgray": "#181818", "orange": "#d9913c",
            "green": "#81bc1b", "red": "red", "blue": "#009cff", "gold": "#f0c030", "organ": "#a00824", "yellow":
            "#d0c800", "money": "#81bc1b" }, "abcdefghijklmnopqrstuvwxyz0123456789#$()[]+-?!',. :>",
            [ 5, 5, 5, 5, 5, 5, 5, 5, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 3, 3, 2, 2, 5, 5, 4, 1, 1, 2, 2, 4, 3, 4]);
        this.bigFont = await BitmapFont.load("fonts/bignumbers.png", { "dark": "#5d5d5d" }, "0123456789",
            [11, 6, 11, 11, 10, 11, 11, 11, 11, 11]);
  }

    private start() {
        this.lastUpdateTime = now();

        // Start music after pressing a key or mouse button because Chrome doesn't want to autostart music
        const startMusic = async () => {
            try {
                await this.playMusicTrack();
                document.removeEventListener("keydown", startMusic);
                document.removeEventListener("mousedown", startMusic);
            } catch (e) {
                document.addEventListener("keydown", startMusic);
                document.addEventListener("mousedown", startMusic);
            }
        }
        startMusic();

        this.loop();
    }

    private loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.boundLoop);
    }

    private updateCanvasSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = window.devicePixelRatio;

        let scale = Math.min(width / gameWidth, height / gameHeight);
        if (this.scalePixelPerfect) {
            scale = Math.max(Math.floor(scale), 1);
        }

        this.canvas.style.width = gameWidth * scale + "px";
        this.canvas.style.height = gameHeight * scale + "px";
        if (this.useRealResolution) {
            this.canvas.width = gameWidth * scale * dpr;
            this.canvas.height = gameHeight * scale * dpr;
            this.scale = scale * dpr;
        } else {
            this.canvas.width = gameWidth;
            this.canvas.height = gameHeight;
            this.scale = 1;
        }
    }

    private update() {
        const prevTime = this.lastUpdateTime;
        this.lastUpdateTime = now();
        const realDt = (this.lastUpdateTime - prevTime) / 1000;
        this.appDt = realDt;
        this.appTime += realDt;
        if (this.paused) {
            this.dt = 0;
        } else {
            this.dt = clamp(realDt, 0, MAX_DT);
            this.gameTime += this.dt;
        }

        this.gamepadInput.update();

        switch (this.stage) {
            case GameStage.TITLE:
                this.updateTitle();
                break;

            case GameStage.MAIN:
                this.updateMain();
                break;

            case GameStage.END:
                this.updateEnd();
                break;

        }
    }

    private draw() {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            return;
        }
        ctx.save();

        // Clear
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Want more pixels!
        ctx.imageSmoothingEnabled = false;

        switch (this.stage) {
            case GameStage.TITLE:
                this.drawTitle(ctx);
                break;

            case GameStage.MAIN:
                this.drawMain(ctx);
                break;

            case GameStage.END:
                this.drawEnd(ctx);
                break;
        }

        ctx.restore();
    }

    private updateTitle(): void {
        if (this.keyHandler.isPressed("Enter")) {
            this.stage = GameStage.MAIN;
        }
    }

    private drawTitle(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.clip();
        ctx.drawImage(this.titleImage, 0, 0);
        const off = (this.appTime * 1000 / 12) % 2000;
        const cx = Math.round(ctx.canvas.width + 100 - off);
        this.mainFont.drawText(ctx, 'Press Enter', 75, 160, "white", 0);
        this.mainFont.drawText(ctx, credits, cx, ctx.canvas.height - 20, "white", 0);
        ctx.restore();
    }

    private updateEnd(): void {
        this.endBoySpriteIndex = getSpriteIndex(0, FLAMEBOY_ANIMATION);
    }

    private drawEnd(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.clip();
        ctx.drawImage(this.endImage, 0, 0);

        ctx.translate(240, 222);
        ctx.scale(2, 2);
        this.endBoy.draw(ctx, this.endBoySpriteIndex);
        ctx.restore();
    }

    private titleFadeOut = 0;
    private endFadeIn = 0;

    public gameOver() {
        this.endFadeIn = 1;
    }

    private updateMain(): void {
        if (this.titleFadeOut < 1) {
            this.titleFadeOut += this.dt;
        }
        if (this.endFadeIn > 0) {
            this.endFadeIn -= this.dt;
            if (this.endFadeIn <= 0) {
                this.stage = GameStage.END;
            }
        }

        // Update all game classes
        for (const obj of this.gameObjects) {
            obj.update(this.dt);
        }
        this.camera.update(this.dt, this.gameTime);
    }

    private drawMain(ctx: CanvasRenderingContext2D) {
        ctx.save();

        // Center coordinate system
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

        // Scale by three because everything was based on 480x300 canvas and now its three times larger
        ctx.scale(this.scale, this.scale);

        // Draw stuff
        this.camera.applyTransform(ctx);
        for (const obj of this.gameObjects) {
            obj.draw(ctx);
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

        if (this.titleFadeOut < 1) {
            ctx.save();
            ctx.beginPath();
            ctx.translate(-ctx.canvas.width * this.titleFadeOut, 0);
            ctx.rect(0, 0, ctx.canvas.width / 2, ctx.canvas.height);
            ctx.clip();
            this.drawTitle(ctx);
            ctx.restore();
            ctx.save();
            ctx.beginPath();
            ctx.translate(ctx.canvas.width * this.titleFadeOut, 0);
            ctx.rect(ctx.canvas.width / 2, 0, ctx.canvas.width / 2, ctx.canvas.height);
            ctx.clip();
            this.drawTitle(ctx);
            ctx.restore();
        }

        if (this.endFadeIn > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.translate(-ctx.canvas.width * this.endFadeIn, 0);
            ctx.rect(0, 0, ctx.canvas.width / 2, ctx.canvas.height);
            ctx.clip();
            this.drawEnd(ctx);
            ctx.restore();
            ctx.save();
            ctx.beginPath();
            ctx.translate(ctx.canvas.width * this.endFadeIn, 0);
            ctx.rect(ctx.canvas.width / 2, 0, ctx.canvas.width / 2, ctx.canvas.height);
            ctx.clip();
            this.drawEnd(ctx);
            ctx.restore();
        }

        // Display FPS counter
        if (this.dev) {
            this.mainFont.drawText(ctx, `${this.framesPerSecond} FPS`, 2 * this.scale, 2 * this.scale, "white");
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
            this.music[1].setVolume(0.25 * this.apocalypseFactor);
            if (this.apocalypseFactor <= 0.001) {
                // End apocalypse
                this.apocalypseFactor = 0;
                this.apocalypse = false;
                this.fire.angry = false;
                this.campaign.runAction("enable", null, [ "fire", "fire3" ]);
                // Music
                this.music[1].stop()
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

    public beginApocalypse() {
        this.apocalypse = true;
        this.world.stopRain();
        // Spawn 3 clouds over fire
        const cx = 1500, cy = 570;
        const coords = [
            [cx, cy],
            [cx - 60, cy - 32],
            [cx + 74, cy - 24]
        ];
        for (let c of coords) {
            const cloud = new Cloud(this, c[0], c[1], {
                velocity: 0,
                distance: 1
            }, true);
            cloud.load().then(() => this.gameObjects.push(cloud));
        }
        this.player.multiJump = true;
        // Some helpful thoughts
        setTimeout(() => this.player.think("This is not over...", 2000), 9000);
        setTimeout(() => this.player.think("There's still something I can do", 4000), 12000);
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

    public togglePause(paused = !this.paused) {
        this.paused = paused;
    }

    public pause() {
        this.togglePause(true);
    }

    public resume() {
        this.togglePause(false);
    }

    public static async create(): Promise<Game> {
        const canvas = document.querySelector<HTMLCanvasElement>("#gameCanvas")!;
        const game = new Game(canvas);
        await game.load();
        game.start();
        return game;
    }

}

Game.create().then(game => {
    (window as any).game = game;
});
