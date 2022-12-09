import { isElectron } from "./util";
import { Game } from "./Game";
import { LoadingScene } from "./scenes/LoadingScene";

export class FriendlyFire extends Game {
    public constructor() {
        super();
    }
}

function presentUpdateAvailable(serviceWorker: ServiceWorker): void {
    document.getElementById("update-banner")!.dataset.state = "update-available";
    document.querySelector("#update-banner .headline")!.innerHTML = "Update available";
    document.querySelector("#update-banner .subhead")!.innerHTML = "Click here to update the app to the latest version";
    document.getElementById("update-banner")!.addEventListener("click", (event) => {
        serviceWorker.postMessage("SKIP_WAITING");
    });
}

/**
 * This promise must be fulfilled prior to the initialization of the application itself.
 */
let prelaunchTask: Promise<unknown> = Promise.resolve();

//#region Service Worker Initialization (cspell:disable)
if (!isElectron() && "serviceWorker" in navigator) {
    prelaunchTask = navigator.serviceWorker.ready;
    let isReloading = false;
    window.addEventListener("load", async () => {
        try {
            const registration = await navigator.serviceWorker.register("./service-worker.js");
            if (registration.waiting !== null) {
                presentUpdateAvailable(registration.waiting);
            }

            // We wait for an UpdateFoundEvent, which is fired anytime a new service worker is acquired
            registration.addEventListener("updatefound", function (updateFoundEvent) {
                // Ignore the event if this is our first service worker and thus not an update
                if (registration.active === null) {
                    return;
                }

                // Listen for any state changes on the new service worker
                registration.installing!.addEventListener("statechange", function (stateChangeEvent) {
                    // Wait for the service worker to enter the installed state (aka waiting)
                    if (this.state !== "installed") {
                        return;
                    }

                    // Present the update available UI
                    presentUpdateAvailable(registration.waiting!);
                });
            });

            // We wait for a ControllerEvent, which is fired when the document acquires a new service worker
            navigator.serviceWorker.addEventListener("controllerchange", async function(controllerChangeEvent) {

                // We delay our code until the new service worker is activated
                await this.ready;

                // Reload the window
                if (!isReloading) {
                    isReloading = true;
                    window.location.reload();
                }
            });

        } catch (e) {
            console.error("Registration of service worker failed.", e);
        }
    });
}
//#endregion (cspell:enable)

prelaunchTask.then(() => {
    const game = new FriendlyFire();
    game.scenes.setScene(LoadingScene);
    (window as any).game = game;
    game.start();
});
