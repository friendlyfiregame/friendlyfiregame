import { World, Environment } from "./World";
import { Player } from "./Player";
import { particles, Particles } from './Particles';
import { Fire } from './Fire';
import { clamp, now } from './util';
import { Face } from './Face';
import { Camera } from './Camera';
import { FireGfx } from './FireGfx';
import { MapInfo } from "./MapInfo";
import { createEntity } from "./Entity";
import "./DummyNPC";
import "./Cloud";
import "./Stone";
import "./FlameBoy";

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

    public particles: Particles;

    public fire: Fire;

    private frameCounter = 0;
    private framesPerSecond = 0;
    private showFPS = true;
    private useRealResolution = false;
    private scale = 1;
    private readonly mapInfo: MapInfo;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.updateCanvasSize();
        window.addEventListener("resize", () => this.updateCanvasSize());
        this.mapInfo = new MapInfo();
        this.boundLoop = this.loop.bind(this);
        this.particles = particles;
        this.gameObjects = [
            this.world = new World(this),
            particles,
            ...this.mapInfo.getGameObjectInfos().map(npc => createEntity(npc.name, this, npc.x, npc.y, npc.properties))
        ];
        this.player = this.getGameObject(Player);
        this.fire =this.getGameObject(Fire);
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
        await Face.load();
        await FireGfx.load();
        for (const obj of this.gameObjects) {
            await obj.load();
        }
    }

    private start() {
        this.lastUpdateTime = now();
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
            ctx.save();
            ctx.fillStyle = "white";
            ctx.font = (10 * this.scale) + "px sans-serif";
            ctx.fillText(`${this.framesPerSecond} FPS`, 2 * this.scale, 10 * this.scale);
            ctx.restore();
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
