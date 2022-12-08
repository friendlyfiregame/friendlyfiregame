import { FullscreenManager } from "./display/FullscreenManager";

export class DisplayManager {

    static #INSTANCE: DisplayManager = new DisplayManager(FullscreenManager.getInstance());
    public static getInstance(): DisplayManager {
        return DisplayManager.#INSTANCE;
    }

    #fullscreenManager: FullscreenManager;

    constructor(fullscreenPreferencesStore: FullscreenManager) {
        this.#fullscreenManager = fullscreenPreferencesStore;
    }

    async setFullscreenEnabled(fullscreenEnabled: boolean): Promise<void> {
        return this.#fullscreenManager.setEnabled(fullscreenEnabled);
    }

    async isFullscreenEnabled(): Promise<boolean> {
        return this.#fullscreenManager.isEnabled();
    }

}
