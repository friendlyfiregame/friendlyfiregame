import { World, Environment } from "./World";
import { Player } from "./Player";
import { particles, Particles } from './Particles';
import { Fire } from './Fire';
import { clamp, now, rndInt } from './util';
import { Face } from './Face';
import { Camera } from './Camera';
import { FireGfx } from './FireGfx';
import { MapInfo } from "./MapInfo";
import { createEntity } from "./Entity";
import { Campaign } from './Campaign';
import { DummyNPC } from './DummyNPC';
import "./Cloud";
import "./Stone";
import "./FlameBoy";
import "./Tree";
import "./Seed";
import { BitmapFont } from "./BitmapFont";
import { Sound } from "./Sound";
import { Stone } from "./Stone";

const gameWidth = 480;
const gameHeight = 270;

export interface GameObject {
    draw(ctx: CanvasRenderingContext2D): void;
    update(dt: number): void;
    load(): Promise<void>;
}

export interface CollidableGameObject extends GameObject {
    collidesWith(x: number, y: number, ignore?: Environment[]): number;
}

export function isCollidableGameObject(object: GameObject): object is CollidableGameObject  {
    return typeof (object as CollidableGameObject).collidesWith === "function";
}

// Max time delta (in s). If game freezes for a few seconds for whatever reason, we don't want updates to jump too much.
const MAX_DT = 0.1;

export class Game {

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

    public campaign: Campaign;

    public particles: Particles;

    public fire: Fire;

    private frameCounter = 0;
    private framesPerSecond = 0;
    private showFPS = true;
    private useRealResolution = false;
    private scale = 1;
    private readonly mapInfo: MapInfo;

    public mainFont!: BitmapFont;
    public bigFont!: BitmapFont;
    public music!: Sound[];

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

        // testing dummy
        this.gameObjects.splice(2, 0, new DummyNPC(this, this.player.x - 25, this.player.y));
        this.camera = new Camera(this, this.player);
        setInterval(() => {
            this.framesPerSecond = this.frameCounter;
            this.frameCounter = 0;
        }, 1000);
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
            new Sound("music/theme_01.mp3")
        ];
        await this.loadFonts();
        await Face.load();
        await FireGfx.load();
        for (const obj of this.gameObjects) {
            await obj.load();
        }
    }

    private async playMusicTrack(): Promise<void> {
        const music = this.music[rndInt(0, 1)];
        this.music.forEach(music => music.stop());
        music.setLoop(true);
        music.setVolume(0.25);
        return music.play();
    };

    private async loadFonts() {
        this.mainFont = await BitmapFont.load("fonts/fontsheet.png", {
            "white": "white", "black": "black", "gray": "gray", "darkgray": "#181818", "orange": "#d9913c",
            "green": "#81bc1b", "red": "red", "blue": "#009cff", "gold": "#f0c030", "organ": "#a00824", "yellow":
            "#d0c800", "money": "#81bc1b" }, "abcdefghijklmnopqrstuvwxyz0123456789#$()[]+-?!',. :",
            [ 5, 5, 5, 5, 5, 5, 5, 5, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 3, 3, 2, 2, 5, 5, 4, 1, 1, 2, 2, 4, 3]);
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
        const scale = Math.min(width / gameWidth, height / gameHeight);
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
        // Update all game classes
        for (const obj of this.gameObjects) {
            obj.update(this.dt);
        }
        this.camera.update(this.dt, this.gameTime);
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

        // Center coordinate system
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

        // Scale by three because everything was based on 480x300 canvas and now its three times larger
        ctx.scale(this.scale, this.scale);

        // Draw stuff
        this.camera.applyTransform(ctx);
        for (const obj of this.gameObjects) {
            obj.draw(ctx);
        }
        this.camera.renderCinematicBars(ctx);

        ctx.restore();

        // Display FPS counter
        if (this.showFPS) {
            this.mainFont.drawText(ctx, `${this.framesPerSecond} FPS`, 2 * this.scale, 2 * this.scale, "white");
        }
        this.frameCounter++;
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
