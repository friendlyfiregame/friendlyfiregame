import { getGameCanvas } from "../graphics";

export interface FullscreenManager {
    isEnabled(): Promise<boolean>;
    setEnabled(enabled: boolean): Promise<any>;
}

export namespace FullscreenManager {
    export const getInstance = (): FullscreenManager => fullscreenManager;
}

const fullscreenManager: FullscreenManager = (window as any)["fullscreen"] || {
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
};
