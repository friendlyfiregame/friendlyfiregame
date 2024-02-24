import { DIALOG_FONT, GAME_CANVAS_HEIGHT, GAME_CANVAS_WIDTH } from "../shared/constants";
import { asset, Assets } from "./Assets";
import { AudioManager } from "./audio/AudioManager";
import { type BitmapFont } from "./BitmapFont";
import { Campaign } from "./Campaign";
import { CharacterSounds } from "./CharacterSounds";
import { FullscreenManager } from "./display/FullscreenManager";
import { DisplayManager, RenderMode } from "./DisplayManager";
import { getGameCanvas, getRenderingContext } from "./graphics";
import { AffineTransform } from "./graphics/AffineTransform";
import { ControllerManager } from "./input/ControllerManager";
import { GamepadInput } from "./input/GamepadInput";
import { Keyboard } from "./input/Keyboard";
import { Scenes } from "./Scenes";
import { SteamworksApi } from "./steamworks/SteamworksApi";
import { clamp, isDev } from "./util";

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
    public readonly characterSounds = new CharacterSounds();

    public backgroundColor: string = "black";

    public canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly gameLoopCallback = this.gameLoop.bind(this);
    private gameLoopId: number | null = null;
    private lastUpdateTime: number = performance.now();
    private mouseTimeout: number = MOUSE_TIMEOUT;
    private frameCounter = 0;
    private framesPerSecond = 0;

    readonly #displayManager: DisplayManager;
    readonly #steamworksApi: SteamworksApi | null;
    readonly #audioManager: AudioManager;
    readonly #fullscreenManager: FullscreenManager;

    @asset(DIALOG_FONT)
    private static readonly font: BitmapFont;

    public constructor(public readonly width: number = GAME_CANVAS_WIDTH, public readonly height: number = GAME_CANVAS_HEIGHT) {
        const canvas = this.canvas = getGameCanvas(width, height);
        this.#displayManager = DisplayManager.getInstance();
        this.#displayManager.onChange.connect(this.updateCanvas, this);
        this.#steamworksApi = SteamworksApi.getInstance();
        this.#audioManager = AudioManager.getInstance();
        this.#fullscreenManager = FullscreenManager.getInstance();
        // Desynchronized sounds like a good idea but unfortunately it prevents pixelated graphics
        // on some systems (Chrome+Windows+NVidia for example which forces bilinear filtering). So
        // it is deactivated here.
        this.ctx = getRenderingContext(canvas, "2d", { alpha: false, desynchronized: false });
        const style = canvas.style;
        style.position = "absolute";
        style.margin = "auto";
        style.left = style.top = style.right = style.bottom = "0";
        document.body.appendChild(this.canvas);
        this.updateCanvas();
        window.addEventListener("resize", () => this.updateCanvas());
        window.addEventListener("pointermove", () => this.mouseMoved());

        // Use Alt+Enter to toggle fullscreen mode.
        window.addEventListener("keydown", async (event) => {
            if (event.altKey && event.key === "Enter") {
                const lockingEnabled = "keyboard" in navigator && "lock" in navigator.keyboard && typeof navigator.keyboard.lock === "function";
                // If the browser is in full screen mode AND fullscreen has been triggered by our own keyboard shortcut...
                if (window.matchMedia("(display-mode: fullscreen)").matches && document.fullscreenElement != null) {
                    if (lockingEnabled) {
                        navigator.keyboard.unlock();
                    }
                    await document.exitFullscreen();
                } else {
                    if (lockingEnabled) {
                        await navigator.keyboard.lock(["Escape"]);
                    }
                    await document.body.requestFullscreen();
                }
            }
        });

        if (isDev()) {
            window.setInterval(() => {
                this.framesPerSecond = this.frameCounter;
                this.frameCounter = 0;
            }, 1000);
        }
    }

    public get displayManager(): DisplayManager {
        return this.#displayManager;
    }

    public get steamworks(): SteamworksApi | null {
        return this.#steamworksApi;
    }

    public get audioManager(): AudioManager {
        return this.#audioManager;
    }

    public get fullscreenManager(): FullscreenManager {
        return this.#fullscreenManager;
    }

    private mouseMoved(): void {
        this.canvas.style.cursor = "default";
        this.mouseTimeout = MOUSE_TIMEOUT;
    }

    private updateMouse(dt: number): void {
        if (this.mouseTimeout > 0) {
            this.mouseTimeout = Math.max(0, this.mouseTimeout - dt);

            if (this.mouseTimeout === 0) {
                this.canvas.style.cursor = "none";
            }
        }
    }

    private updateCanvas(): void {
        const { width, height } = this;
        const renderMode = this.displayManager.getRenderMode();

        let scale = Math.min(window.innerWidth / width, window.innerHeight / height);
        if (renderMode === RenderMode.PIXEL_PERFECT) {
            scale = Math.max(1, Math.floor(scale));
        }
        const canvas = this.canvas;
        const style = canvas.style;
        if (renderMode === RenderMode.NATIVE) {
            const dpr = window.devicePixelRatio;
            canvas.width = width * scale * dpr;
            canvas.height = height * scale * dpr;
            style.imageRendering = "auto";
        } else {
            canvas.width = width;
            canvas.height = height;
            style.imageRendering = "pixelated";
            style.imageRendering = "crisp-edges";
        }
        style.width = Math.round(width * scale) + "px";
        style.height = Math.round(height * scale) + "px";
    }

    private readonly rootTransform = new AffineTransform();

    private gameLoop(): void {
        const renderMode = this.displayManager.getRenderMode();

        const { ctx, width, height } = this;
        ctx.save();
        if (renderMode === RenderMode.NATIVE) {
            ctx.scale(ctx.canvas.width / width, ctx.canvas.height / height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
        } else {
            ctx.imageSmoothingEnabled = false;
        }
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, width, height);

        this.rootTransform.setFromCanvas(ctx);
        const currentUpdateTime = performance.now();
        const dt = clamp((currentUpdateTime - this.lastUpdateTime) / 1000, 0, MAX_DT);
        this.update(dt, this.rootTransform);
        this.lastUpdateTime = currentUpdateTime;
        this.draw(ctx, width, height);

        ctx.restore();

        this.nextFrame();
    }

    private nextFrame(): void {
        this.gameLoopId = requestAnimationFrame(this.gameLoopCallback);
    }

    protected update(dt: number, rootTransform?: AffineTransform): void {
        this.gamepad.update();
        this.updateMouse(dt);
        this.scenes.update(dt, rootTransform);
    }

    protected draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        this.scenes.draw(ctx, width, height);

        // Display FPS counter
        if (isDev()) {
            Game.font?.drawText(
                ctx,
                `${this.framesPerSecond} FPS`,
                2, -1,
                "white"
            );
            this.frameCounter++;
        }
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
