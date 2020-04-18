
interface GameObject {
    draw(dt: number): void;
    update(dt: number): void;
}

export class Game {

    private canvas: HTMLCanvasElement;

    private lastUpdateTime: number;

    private dt: number = 0;

    private boundLoop: () => void;

    private gameObjects: GameObject[] = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.lastUpdateTime = Date.now();
        this.boundLoop = this.loop.bind(this);
        this.loop();
        this.gameObjects = [];
    }

    private loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.boundLoop);
    }

    private update() {
        const prevTime = this.lastUpdateTime;
        this.lastUpdateTime = Date.now();
        const dt = this.lastUpdateTime - prevTime;
        this.dt = dt;
        // Update all game classes
        for (const obj of this.gameObjects) {
            obj.update(dt);
        }
    }

    private draw() {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        // Clear
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = "#" + Math.random().toString(16).substr(-6);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stuff
        for (const obj of this.gameObjects) {
            obj.draw(this.dt);
        }
    }


}

const canvas = document.querySelector<HTMLCanvasElement>("#gameCanvas")!;
const game = new Game(canvas);
(window as any).game = game;
