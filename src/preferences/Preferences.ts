import { getGameCanvas } from "../graphics";
import { AudioPreferencesStore } from "../audio/AudioPreferencesStore";
import { clamp } from "../util";

export interface Preferences {
    readonly fullscreen: {
        setEnabled(enabled: boolean): Promise<void>;
        isEnabled(): Promise<boolean>;
    };
    readonly audio: AudioPreferencesStore;
}

export namespace Preferences {
    export const getInstance = () => preferences;
}

/**
 * Default preferences as backed by the browser-only version of the game.
 */
const webPreferences: Preferences = {
    fullscreen: {
        isEnabled: async () => Promise.resolve(document.fullscreenEnabled && document.fullscreenElement != null),
        setEnabled: async (fullscreen: boolean) => {
            const gameCanvas = getGameCanvas();
            const currentFullscreenElement = document.fullscreenElement;
            if (fullscreen && currentFullscreenElement !== gameCanvas) {
                return gameCanvas.requestFullscreen({ navigationUI: "hide" });
            } else if (!fullscreen && currentFullscreenElement != null) {
                return document.exitFullscreen();
            }

        }
    },
    audio: {
        getMusicGain: async () => Promise.resolve(clamp((Number(window.localStorage.getItem("audio.music.gain")) || 1), 0, 1)),
        setMusicGain: async(value: number) => { window.localStorage.setItem("audio.music.gain", String(clamp(value, 1, 0))); },
        getSfxGain: async () => Promise.resolve(clamp((Number(window.localStorage.getItem("audio.sfx.gain") || 1)), 0, 1)),
        setSfxGain: async(value: number) => { window.localStorage.setItem("audio.sfx.gain", String(clamp(value, 1, 0))); },
    }
};

const preferences: Preferences = (window as any)["preferences"] || webPreferences;

declare global {
    interface Window {
      preferences: Preferences;
    }
}
