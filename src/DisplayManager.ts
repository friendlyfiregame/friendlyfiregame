import { Preferences } from "./preferences/Preferences";

interface FullscreenPreferencesStore {
    setEnabled(enabled: boolean): Promise<void>;
    isEnabled(): Promise<boolean>;
}

export class DisplayManager {
    static #INSTANCE: DisplayManager = new DisplayManager(Preferences.getInstance().fullscreen);
    public static getInstance(): DisplayManager {
        return DisplayManager.#INSTANCE;
    }
    #fullscreenPreferencesStore: FullscreenPreferencesStore;
    constructor(fullscreenPreferencesStore: FullscreenPreferencesStore) {
        this.#fullscreenPreferencesStore = fullscreenPreferencesStore;
    }
    async setFullscreenEnabled(fullscreenEnabled: boolean): Promise<void> {
        return this.#fullscreenPreferencesStore.setEnabled(fullscreenEnabled);
    }
    async isFullscreenEnabled(): Promise<boolean> {
        return this.#fullscreenPreferencesStore.isEnabled();
    }
}
