import { FullscreenManager } from "./display/FullscreenManager";
import { Signal } from "./Signal";

export enum RenderMode {
    PIXEL_IMPERFECT = "pixel-imperfect",
    PIXEL_PERFECT = "pixel-perfect",
    NATIVE = "native"
}

export const DEFAULT_RENDER_MODE = RenderMode.PIXEL_IMPERFECT;

const PREFERENCES_DISPLAY_RENDER_MODE = "display.renderMode";

class DisplayPreferencesStore {
    public constructor() {
        if (window.localStorage.getItem(PREFERENCES_DISPLAY_RENDER_MODE) == null) {
            this.renderMode = DEFAULT_RENDER_MODE;
        }
    }

    public get renderMode(): RenderMode {
        return (window.localStorage.getItem(PREFERENCES_DISPLAY_RENDER_MODE) as RenderMode ?? DEFAULT_RENDER_MODE);
    }

    public set renderMode(value: RenderMode) {
        window.localStorage.setItem(PREFERENCES_DISPLAY_RENDER_MODE, value);
    }
}

export class DisplayManager {
    static readonly #INSTANCE: DisplayManager = new DisplayManager(FullscreenManager.getInstance());
    readonly #fullscreenManager: FullscreenManager;
    readonly #displayPreferencesStore = new DisplayPreferencesStore();

    public readonly onChange = new Signal();

    public static getInstance(): DisplayManager {
        return DisplayManager.#INSTANCE;
    }

    public constructor(fullscreenPreferencesStore: FullscreenManager) {
        this.#fullscreenManager = fullscreenPreferencesStore;
    }

    public async setFullscreenEnabled(fullscreenEnabled: boolean): Promise<void> {
        return this.#fullscreenManager.setEnabled(fullscreenEnabled);
    }

    public async isFullscreenEnabled(): Promise<boolean> {
        return this.#fullscreenManager.isEnabled();
    }

    public setRenderMode(renderMode: RenderMode): void {
        this.#displayPreferencesStore.renderMode = renderMode;
        this.onChange.emit();
    }

    public getRenderMode(): RenderMode {
        return this.#displayPreferencesStore.renderMode;
    }
}
