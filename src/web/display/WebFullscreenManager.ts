import type { FullscreenManager as FullscreenManager } from "../../shared/FullscreenManager";

/**
 * Fullscreen management suitable for modern browsers.
 */
 export class WebFullscreenManager implements FullscreenManager {

    async isEnabled(): Promise<boolean> {
        return Promise.resolve(document.fullscreenEnabled && document.fullscreenElement != null);
    }

    async setEnabled(fullscreen: boolean): Promise<void> {
        const currentFullscreenElement = document.fullscreenElement;
        if (!document.fullscreenEnabled) {
            return Promise.resolve();
        } else if (fullscreen && currentFullscreenElement !== document.documentElement) {
            return document.documentElement.requestFullscreen({ navigationUI: "hide" });
        } else if (!fullscreen && currentFullscreenElement != null) {
            return document.exitFullscreen();
        }
    }

}
