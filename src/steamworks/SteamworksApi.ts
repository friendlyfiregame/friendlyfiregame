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

export namespace SteamworksApi {
    export const getInstance = (): SteamworksApi => steamworks;
}

const steamworks: SteamworksApi = (window as any)["steamworks"] || {
    available: false
};
