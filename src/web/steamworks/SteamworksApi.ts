import { type SteamworksApi as ISteamworksApi } from "../../shared/SteamworksApi";

export type SteamworksApi = ISteamworksApi;
export namespace SteamworksApi {
    export const getInstance = (): ISteamworksApi | null => window.steamworks ?? null;
}
