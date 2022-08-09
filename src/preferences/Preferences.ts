import { getCanvas } from "../graphics";

export interface Preferences {
    readonly fullscreen: {
        setEnabled(enabled: boolean): Promise<void>;
        isEnabled(): Promise<boolean>;
    };
}

/**
 * Default preferences as backed by the browser-only version of the game.
 */
const webPreferences: Preferences = {
    fullscreen: {
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
