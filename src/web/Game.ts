import { Assets } from "./Assets";
import { Campaign } from "./Campaign";
import { clamp } from "./util";
import { ControllerManager } from "./input/ControllerManager";
import { getGameCanvas, getRenderingContext } from "./graphics";
import { GAME_CANVAS_HEIGHT, GAME_CANVAS_WIDTH } from "../shared/constants";
import { GamepadInput } from "./input/GamepadInput";
import { Keyboard } from "./input/Keyboard";
import { Scenes } from "./Scenes";
import { CharacterSounds } from "./CharacterSounds";
import { SteamworksApi } from "./steamworks/SteamworksApi";
import { AudioManager } from "./audio/AudioManager";
import { DisplayManager } from "./DisplayManager";
import { FullscreenManager } from "./display/FullscreenManager";

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

    readonly #displayManager: DisplayManager;
    readonly #steamworksApi: SteamworksApi | null;
    readonly #audioManager: AudioManager;
    readonly #fullscreenManager: FullscreenManager;

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

        let scale = Math.min(window.innerWidth / width, window.innerHeight / height);
        if (this.displayManager.isPixelPerfectEnabled()) {
            scale = Math.max(1, Math.floor(scale));
        }
        const style = this.canvas.style;
        style.width = width * scale + "px";
        style.height = height * scale + "px";
        if (this.displayManager.isImageSmoothingEnabled()) {
            style.imageRendering = "auto";
        } else {
            style.imageRendering = "pixelated";
            style.imageRendering = "crisp-edges";
        }
    }

    private gameLoop(): void {
        const currentUpdateTime = performance.now();
        const dt = clamp((currentUpdateTime - this.lastUpdateTime) / 1000, 0, MAX_DT);
        this.update(dt);
        this.lastUpdateTime = currentUpdateTime;

        const { ctx, width, height } = this;
        ctx.save();
        ctx.imageSmoothingEnabled = this.displayManager.isImageSmoothingEnabled();
        ctx.imageSmoothingQuality = "high";
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        this.draw(ctx, width, height);
        ctx.restore();

        this.nextFrame();
    }

    private nextFrame(): void {
        this.gameLoopId = requestAnimationFrame(this.gameLoopCallback);
    }

    protected update(dt: number): void {
        this.gamepad.update();
        this.updateMouse(dt);
        this.scenes.update(dt);
    }

    protected draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        this.scenes.draw(ctx, width, height);
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
