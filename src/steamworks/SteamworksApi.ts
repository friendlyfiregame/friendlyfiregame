export interface SteamworksApi {
    readonly available: boolean;
    initialized(): Promise<boolean>;
    readonly localplayer: { // cSpell:disable-line Yeah... it's already wrong upstreams...
        getName(): Promise<string>;
        getSteamId(): Promise<any>;
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

export const steamworks: SteamworksApi = (window as any)["steamworks"] || {
    available: false
};

// After the electron preload script has been executed, a new global field "steamworks" will be available.
// If the script has not been run, the available() function will have been initialized to always return false.
declare global {
    interface Window {
      steamworks: SteamworksApi;
    }
}
