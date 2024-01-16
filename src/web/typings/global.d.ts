import type { SteamworksApi } from "../../shared/SteamworksApi";
import type { FriendlyFire } from "../../web/FriendlyFire";

interface Keyboard {
    lock(keyCodes?: Iterable<DOMString>): Promise<void>;
    unlock(): void;
}

declare global {
    interface Navigator {
        // See https://wicg.github.io/keyboard-lock/
        readonly keyboard: Keyboard
    }

    interface Window {
        steamworks?: SteamworksApi;
        webkitAudioContext?: AudioContext;
        game?: FriendlyFire;
    }
}
