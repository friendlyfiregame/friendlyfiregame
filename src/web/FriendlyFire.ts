import { isElectron } from "./util";
import { Game } from "./Game";
import { LoadingScene } from "./scenes/LoadingScene";

export class FriendlyFire extends Game {
    public constructor() {
        super();
    }
}

if (!isElectron() && "serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            const registration = await navigator.serviceWorker.register("./service-worker.js");
            return registration.update();
        } catch (e) {
            console.error("Registration of service worker failed.", e);
        }
    });
  }

const game = new FriendlyFire();
game.scenes.setScene(LoadingScene);
(window as any).game = game;
game.start();
