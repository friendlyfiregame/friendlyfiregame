import { World } from "./World";
import { Player } from "./Player";
import { DummyNPC } from './DummyNPC';

export interface GameObject {
    draw(ctx: CanvasRenderingContext2D): void;
    update(dt: number): void;
    load(): Promise<void>;
}

export class Game {

    private canvas: HTMLCanvasElement;

    private lastUpdateTime = Date.now();

    private dt = 0;

    private boundLoop: () => void;

    public gameObjects: GameObject[] = [];

    private paused = false;

    public world: World;

    public player: Player;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.boundLoop = this.loop.bind(this);
        this.player = new Player(this, 2656, 1270);
        this.world = new World(this);
        this.gameObjects = [
            this.player,
            new DummyNPC(this, 2580, 1245),
        ];
    }

    private async load() {
        await this.world.load();
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
        if (this.paused) {
            this.dt = 0;
        } else {
            const dt = this.lastUpdateTime - prevTime;
            this.dt = dt;
        }
        // Update all game classes
        this.world.update(this.dt);
        for (const obj of this.gameObjects) {
            obj.update(this.dt);
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
        ctx.fillStyle = "blue";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

        // Draw stuff
        this.world.draw(ctx);
        ctx.translate(-this.player.x, this.player.y);
        for (const obj of this.gameObjects) {
            obj.draw(ctx);
        }

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
