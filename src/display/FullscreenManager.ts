export interface FullscreenManager {

    /**
     * Checks whether the game is currently in fullscreen mode.
     */
    isEnabled(): Promise<boolean>;

    /**
     * Enables or disables fullscreen mode for the game.
     * @param enabled
     *   Whether to enable or disable fullscreen mode.
     */
    setEnabled(enabled: boolean): Promise<any>;
}

/**
 * Fullscreen management suitable for modern browsers.
 */
class WebFullscreenManager implements FullscreenManager {

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

export namespace FullscreenManager {
    export const getInstance = (): FullscreenManager => fullscreenManager;
}

const fullscreenManager: FullscreenManager = (window as any)["fullscreen"] || new WebFullscreenManager();
