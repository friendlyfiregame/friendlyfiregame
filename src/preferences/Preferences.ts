import { getGameCanvas } from "../graphics";
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
        getMusicGain: async () => Promise.resolve(getMusicGainNode().gain.value),
        setMusicGain: async(value: number) => { (getMusicGainNode().gain.value = value); },
        getSfxGain: async () => Promise.resolve(getSfxGainNode().gain.value),
        setSfxGain: async(value: number) => { (getSfxGainNode().gain.value = value); }
    }
};
