import { World } from "./World";
import { Player } from "./Player";
import { DummyNPC } from './DummyNPC';
import { particles, Particles } from './Particles';
import { Fire } from './Fire';
import { clamp } from './util';
import { Face } from './Face';
import { Camera } from './Camera';

export interface GameObject {
    draw(ctx: CanvasRenderingContext2D): void;
    update(dt: number): void;
    load(): Promise<void>;
}

// Max time delta (in s). If game freezes for a few seconds for whatever reason, we don't want updates to jump too much.
const MAX_DT = 0.1;

export class Game {

    private canvas: HTMLCanvasElement;

    private lastUpdateTime = Date.now();

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

    public fire: Fire;

    public particles: Particles;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.boundLoop = this.loop.bind(this);
        this.player = new Player(this, 2656, 1270);
        this.fire = new Fire(this, 2450, 1170);
        this.particles = particles;
        this.camera = new Camera(this.player);
        this.gameObjects = [
            this.world = new World(this),
            particles,
            this.fire,
            this.player,
            new DummyNPC(this, 2570, 1245),
        ];
    }

    private async load() {
        await Face.load();
        for (const obj of this.gameObjects) {
            await obj.load();
        }
    }

    private start() {
        this.lastUpdateTime = Date.now();
        this.loop();
    }

    private loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.boundLoop);
    }

    private update() {
        const prevTime = this.lastUpdateTime;
        this.lastUpdateTime = Date.now();
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
        ctx.scale(3, 3);

        // Draw stuff
        this.camera.applyTransform(ctx);
        for (const obj of this.gameObjects) {
            obj.draw(ctx);
        }
        this.camera.renderCinematicBars(ctx);

        ctx.restore();
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
