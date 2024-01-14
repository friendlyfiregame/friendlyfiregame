import { Signal } from "./Signal";
import { FullscreenManager } from "./display/FullscreenManager";

const PREFERENCES_DISPLAY_PIXEL_PERFECT = "display.pixelPerfect";
const DEFAULT_PIXEL_PERFECT_VALUE = false;
const PREFERENCES_DISPLAY_IMAGE_SMOOTHING = "display.imageSmoothing";
const DEFAULT_IMAGE_SMOOTHING_VALUE = false;

class DisplayPreferencesStore {
    constructor() {
        if (window.localStorage.getItem(PREFERENCES_DISPLAY_PIXEL_PERFECT) == null) {
            this.pixelPerfect = DEFAULT_PIXEL_PERFECT_VALUE;
        }
        if (window.localStorage.getItem(PREFERENCES_DISPLAY_IMAGE_SMOOTHING) == null) {
            this.pixelPerfect = DEFAULT_IMAGE_SMOOTHING_VALUE;
        }
    }

    get pixelPerfect(): boolean {
        return (window.localStorage.getItem(PREFERENCES_DISPLAY_PIXEL_PERFECT) ?? JSON.stringify(DEFAULT_PIXEL_PERFECT_VALUE)) === "true";
    }

    set pixelPerfect(value: boolean) {
        window.localStorage.setItem(PREFERENCES_DISPLAY_PIXEL_PERFECT, JSON.stringify(value));
    }

    set imageSmoothing(value: boolean) {
        window.localStorage.setItem(PREFERENCES_DISPLAY_IMAGE_SMOOTHING, JSON.stringify(value));
    }

    get imageSmoothing(): boolean {
        return (window.localStorage.getItem(PREFERENCES_DISPLAY_IMAGE_SMOOTHING) ?? JSON.stringify(DEFAULT_IMAGE_SMOOTHING_VALUE)) === "true";
    }
}

export class DisplayManager {
    static #INSTANCE: DisplayManager = new DisplayManager(FullscreenManager.getInstance());
    #fullscreenManager: FullscreenManager;
    #displayPreferencesStore = new DisplayPreferencesStore();

    public readonly onChange = new Signal();

    public static getInstance(): DisplayManager {
        return DisplayManager.#INSTANCE;
    }

    constructor(fullscreenPreferencesStore: FullscreenManager) {
        this.#fullscreenManager = fullscreenPreferencesStore;
    }

    async setFullscreenEnabled(fullscreenEnabled: boolean): Promise<void> {
        return this.#fullscreenManager.setEnabled(fullscreenEnabled);
    }

    async isFullscreenEnabled(): Promise<boolean> {
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
