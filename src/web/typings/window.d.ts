import { type SteamworksApi } from "../../shared/SteamworksApi";
import { type FriendlyFire } from "../../web/FriendlyFire";

declare global {
    interface Window {
        steamworks?: SteamworksApi;
        webkitAudioContext?: AudioContext;
        game?: FriendlyFire;
    }
}
