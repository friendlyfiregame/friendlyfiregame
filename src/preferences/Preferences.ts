import { getCanvas } from "../graphics";
import { getSfxGainNode, getMusicGainNode } from "../Sound";

export interface Preferences {
    readonly fullscreen: {
        enabled: boolean;
        setEnabled(enabled: boolean): Promise<void>;
        isEnabled(): Promise<boolean>;
    };
    readonly audio: {
        getMusicGain(): Promise<number>;
        setMusicGain(volume: number): Promise<void>;
        getSfxGain(): Promise<number>;
        setSfxGain(volume: number): Promise<void>;
    };
}



/**
 * Default preferences as backed by the browser-only version of the game.
 */
const webPreferences: Preferences = {
    fullscreen: {
        get enabled(): boolean { return (localStorage.getItem("fullscreen.enabled") || "true") === "true"; },
        set enabled(enabled: boolean) { localStorage.setItem("fullscreen.enabled", enabled.toString()); },
        isEnabled: async () => Promise.resolve(document.fullscreenEnabled && document.fullscreenElement != null),
        setEnabled: async (fullscreen: boolean) => {
            if (fullscreen && document.fullscreenElement == null) {
                const gameCanvas = getCanvas();
                console.log(gameCanvas);
                gameCanvas.requestFullscreen();
            } else if (!fullscreen && document.fullscreenElement != null) {
                document.exitFullscreen();
            }

        }
    },
    audio: {
        getMusicGain: async () => Promise.resolve(getMusicGainNode().gain.value),
        setMusicGain: async(value: number) => { (getMusicGainNode().gain.value = value); },
        getSfxGain: async () => Promise.resolve(getSfxGainNode().gain.value),
        setSfxGain: async(value: number) => { (getSfxGainNode().gain.value = value); }
    }
};

export const preferences: Preferences = (window as any)["preferences"] || webPreferences;

// After the electron preload script has been executed, a new global field "steamworks" will be available.
// If the script has not been run, the available() function will have been initialized anyways to return
// false.
declare global {
    interface Window {
      preferences: Preferences;
    }
}
