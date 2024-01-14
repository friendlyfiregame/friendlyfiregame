import { Signal } from "./Signal";
import { FullscreenManager } from "./display/FullscreenManager";

const PREFERENCES_DISPLAY_PIXEL_PERFECT = "display.pixelPerfect";
const DEFAULT_PIXEL_PERFECT_VALUE = false;
const PREFERENCES_DISPLAY_IMAGE_SMOOTHING = "display.imageSmoothing";
const DEFAULT_IMAGE_SMOOTHING_VALUE = false;

class DisplayPreferencesStore {
    public constructor() {
        if (window.localStorage.getItem(PREFERENCES_DISPLAY_PIXEL_PERFECT) == null) {
            this.pixelPerfect = DEFAULT_PIXEL_PERFECT_VALUE;
        }
        if (window.localStorage.getItem(PREFERENCES_DISPLAY_IMAGE_SMOOTHING) == null) {
            this.pixelPerfect = DEFAULT_IMAGE_SMOOTHING_VALUE;
        }
    }

    public get pixelPerfect(): boolean {
        return (window.localStorage.getItem(PREFERENCES_DISPLAY_PIXEL_PERFECT) ?? JSON.stringify(DEFAULT_PIXEL_PERFECT_VALUE)) === "true";
    }

    public set pixelPerfect(value: boolean) {
        window.localStorage.setItem(PREFERENCES_DISPLAY_PIXEL_PERFECT, JSON.stringify(value));
    }

    public set imageSmoothing(value: boolean) {
        window.localStorage.setItem(PREFERENCES_DISPLAY_IMAGE_SMOOTHING, JSON.stringify(value));
    }

    public get imageSmoothing(): boolean {
        return (window.localStorage.getItem(PREFERENCES_DISPLAY_IMAGE_SMOOTHING) ?? JSON.stringify(DEFAULT_IMAGE_SMOOTHING_VALUE)) === "true";
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

    public setPixelPerfectEnabled(pixelPerfect: boolean): void {
        this.#displayPreferencesStore.pixelPerfect = pixelPerfect;
        this.onChange.emit();
    }

    public isPixelPerfectEnabled(): boolean {
        return this.#displayPreferencesStore.pixelPerfect;
    }

    public setImageSmoothingEnabled(imageSmoothing: boolean): void {
        this.#displayPreferencesStore.imageSmoothing = imageSmoothing;
        this.onChange.emit();
    }

    public isImageSmoothingEnabled(): boolean {
        return this.#displayPreferencesStore.imageSmoothing;
    }
}
