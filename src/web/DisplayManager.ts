import { FullscreenManager } from "./display/FullscreenManager";

export class DisplayManager {
    static readonly #INSTANCE: DisplayManager = new DisplayManager(FullscreenManager.getInstance());

    public static getInstance(): DisplayManager {
        return DisplayManager.#INSTANCE;
    }

    readonly #fullscreenManager: FullscreenManager;

    public constructor(fullscreenPreferencesStore: FullscreenManager) {
        this.#fullscreenManager = fullscreenPreferencesStore;
    }

    public async setFullscreenEnabled(fullscreenEnabled: boolean): Promise<void> {
        return this.#fullscreenManager.setEnabled(fullscreenEnabled);
    }

    public async isFullscreenEnabled(): Promise<boolean> {
        return this.#fullscreenManager.isEnabled();
    }
}
