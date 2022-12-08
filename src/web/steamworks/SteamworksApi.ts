import type { SteamworksApi as ISteamworksApi } from "../../shared/SteamworksApi";

export type SteamworksApi = ISteamworksApi;
export namespace SteamworksApi {
    export const getInstance = (): ISteamworksApi => steamworks;
}

const steamworks: ISteamworksApi = (window as any)["steamworks"] || {
    available: false
};
