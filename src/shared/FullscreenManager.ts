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
    setEnabled(enabled: boolean): Promise<void>;
}
