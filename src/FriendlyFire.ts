import { Game } from "./Game";
import { LoadingScene } from "./scenes/LoadingScene";

export class FriendlyFire extends Game {
    public constructor() {
        super();
    }
}

(async () => {

    if ("keyboard" in navigator && "lock" in navigator.keyboard && typeof navigator.keyboard.lock === "function") {
        await navigator.keyboard.lock();
    }

    const game = new FriendlyFire();
    game.scenes.setScene(LoadingScene);
    (window as any).game = game;
    game.start();

})();
