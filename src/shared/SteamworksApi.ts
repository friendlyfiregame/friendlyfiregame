export interface SteamworksApi {

    /**
     * Flag that indicates if the Steamworks API is generally available.
     * It is possible, that the API is available, but has not yet been initialized, though!
     * Make sure, to call {@linkcode initialized()} to check if the API is
     * fully functional or not.
     */
    readonly available: boolean;

    initialized(): Promise<boolean>;
    readonly localplayer: {
        getName(): Promise<string>;
        getSteamId(): Promise<unknown>;
    };
    readonly achievement: {
        isActivated(achievementId: string): Promise<boolean>;
        activate(achievementId: string): Promise<boolean>;
    };
    readonly cloud: {
        isEnabledForApp(): Promise<boolean>;
        isEnabledForAccount(): Promise<boolean>;
        readFile(name: string): Promise<boolean>;
        writeFile(name: string, content: string): Promise<boolean>;
        deleteFile(name: string): Promise<boolean>;
    };
}
