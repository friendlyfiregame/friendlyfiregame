
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

    private gameObjects: GameObject[] = [];

    private paused = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.boundLoop = this.loop.bind(this);
        this.gameObjects = [
            // ...
        ];
    }

    private async load() {
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
        for (const obj of this.gameObjects) {
            obj.update(this.dt);
        }
    }

    private draw() {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        // Clear
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (this.dt > 0) {
            ctx.fillStyle = "#" + Math.random().toString(16).substr(-6);
        }
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stuff
        for (const obj of this.gameObjects) {
            obj.draw(ctx);
        }
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
