import { Assets } from './Assets';
import { Campaign } from './Campaign';
import { clamp } from './util';
import { ControllerManager } from './input/ControllerManager';
import { createCanvas, getRenderingContext } from './graphics';
import { GAME_CANVAS_SIZE } from './constants';
import { GamepadInput } from './input/GamepadInput';
import { Keyboard } from './input/Keyboard';
import { Scenes } from './Scenes';
import { Size } from './Geometry';

/**
 * Max time delta (in s). If game freezes for a few seconds for whatever reason, we don't want
 * updates to jump too much.
 */
const MAX_DT = 0.1;

/** Number of seconds the mouse is visible after moving it */
const MOUSE_TIMEOUT = 2.0;

export abstract class Game {
    public readonly controllerManager = ControllerManager.getInstance();
    public readonly keyboard = new Keyboard();
    public readonly gamepad = new GamepadInput();
    public readonly scenes = new Scenes(this);
    public readonly assets = new Assets();
    public readonly campaign = new Campaign(this);

    public backgroundColor: string = "black";

    public canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly gameLoopCallback = this.gameLoop.bind(this);
    private gameLoopId: number | null = null;
    private lastUpdateTime: number = performance.now();
    private mouseTimeout: number = MOUSE_TIMEOUT;

    public constructor(public readonly size = GAME_CANVAS_SIZE) {
        const canvas = this.canvas = createCanvas(size);
        // Desynchronized sounds like a good idea but unfortunately it prevents pixelated graphics
        // on some systems (Chrome+Windows+NVidia for example which forces bilinear filtering). So
        // it is deactivated here.
        this.ctx = getRenderingContext(canvas, "2d", { alpha: false, desynchronized: false });
        const style = canvas.style;
        style.position = "absolute";
        style.margin = "auto";
        style.left = style.top = style.right = style.bottom = "0";
        style.imageRendering = "pixelated";
        style.imageRendering = "crisp-edges";
        document.body.appendChild(this.canvas);
        this.updateCanvasSize();
        window.addEventListener("resize", () => this.updateCanvasSize());
        window.addEventListener("pointermove", () => this.mouseMoved());
    }

    private mouseMoved() {
        this.canvas.style.cursor = "default";
        this.mouseTimeout = MOUSE_TIMEOUT;
    }

    private updateMouse(dt: number) {
        if (this.mouseTimeout > 0) {
            this.mouseTimeout = Math.max(0, this.mouseTimeout - dt);

            if (this.mouseTimeout === 0) {
                this.canvas.style.cursor = "none";
            }
        }
    }

    private updateCanvasSize(): void {
        const { size } = this;

        const scale = Math.max(
            1,
            Math.floor(Math.min(window.innerWidth / size.width, window.innerHeight / size.height))
        );

        const style = this.canvas.style;
        style.width = size.width * scale + "px";
        style.height = size.height * scale + "px";
    }

    private gameLoop(): void {
        const currentUpdateTime = performance.now();
        const dt = clamp((currentUpdateTime - this.lastUpdateTime) / 1000, 0, MAX_DT);
        this.update(dt);
        this.lastUpdateTime = currentUpdateTime;

        const { ctx, size } = this;
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, size.width, size.height);
        this.draw(ctx, size);
        ctx.restore();

        this.nextFrame();
    }

    private nextFrame() {
        this.gameLoopId = requestAnimationFrame(this.gameLoopCallback);
    }

    protected update(dt: number): void {
        this.gamepad.update();
        this.updateMouse(dt);
        this.scenes.update(dt);
    }

    protected draw(ctx: CanvasRenderingContext2D, size: Size): void {
        this.scenes.draw(ctx, size);
    }

    public start(): void {
        if (this.gameLoopId == null) {
            this.lastUpdateTime = performance.now();
            this.nextFrame();
        }
    }

    public stop(): void {
        if (this.gameLoopId != null) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
    }
}
