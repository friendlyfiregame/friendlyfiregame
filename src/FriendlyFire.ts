import { steamworks } from "./steamworks/SteamworksApi";
import { preferences } from "./preferences/Preferences";

import { Game } from "./Game";
import { LoadingScene } from "./scenes/LoadingScene";

export class FriendlyFire extends Game {
    public constructor() {
        super();
    }
}

if ((window as any)["preferences"] == null) {
    (window as any)["preferences"] = preferences;
}

if ((window as any)["steamworks"] == null) {
    (window as any)["steamworks"] = steamworks;
}

const game = new FriendlyFire();
game.scenes.setScene(LoadingScene);
(window as any).game = game;
game.start();
