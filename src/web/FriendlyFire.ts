import { Game } from "./Game";
import { LoadingScene } from "./scenes/LoadingScene";
import { isElectron } from "./util";

export class FriendlyFire extends Game {
    public constructor() {
        super();
    }
}

function presentUpdateAvailable(serviceWorker: ServiceWorker): void {
    (document.getElementById("update-banner") as HTMLDivElement).dataset.state = "update-available";
    (document.querySelector("#update-banner .headline") as HTMLDivElement).innerHTML = "Update available";
    (document.querySelector("#update-banner .subhead") as HTMLDivElement).innerHTML = "Click here to update the app to the latest version";
    (document.getElementById("update-banner") as HTMLDivElement).addEventListener("click", (event) => {
        serviceWorker.postMessage("SKIP_WAITING");
    });
}

/**
 * This promise must be fulfilled prior to the initialization of the application itself.
 */
let prelaunchTask: Promise<unknown> = Promise.resolve();

//#region Service Worker Initialization
if (!isElectron()) {

    const body = document.getElementsByTagName("body")[0];
    const touchGamepadScript = document.createElement("script");
    touchGamepadScript.setAttribute("defer", "true");
    touchGamepadScript.setAttribute("src", "./touch-controls.js");
    body.appendChild(touchGamepadScript);

    if ("registerProtocolHandler" in navigator && window.location.hostname === "play.friendlyfiregame.com") {
        navigator.registerProtocolHandler("web+friendlyfiregame", "https://play.friendlyfiregame.com/?s=%s");
    }

    if (process.env["MODE"] === "production" && "serviceWorker" in navigator) {
        prelaunchTask = navigator.serviceWorker.ready;
        let isReloading = false;
        window.addEventListener("load", async () => {
            try {
                const registration = await navigator.serviceWorker.register("./service-worker.js");
                if (registration.waiting !== null) {
                    presentUpdateAvailable(registration.waiting);
                }

                // We wait for an UpdateFoundEvent, which is fired anytime a new service worker is acquired
                registration.addEventListener("updatefound", function(updateFoundEvent) {
                    // Ignore the event if this is our first service worker and thus not an update
                    if (registration.active === null) {
                        return;
                    }

                    // Listen for any state changes on the new service worker
                    registration.installing?.addEventListener("statechange", function(stateChangeEvent) {
                        // Wait for the service worker to enter the installed state (aka waiting)
                        if (this.state !== "installed") {
                            return;
                        }

                        // Present the update available UI
                        if (registration.waiting != null) {
                            presentUpdateAvailable(registration.waiting);
                        }
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
}
//#endregion

(async () => {
    await prelaunchTask;
    const game = new FriendlyFire();
    window.game = game;
    void game.scenes.setScene(LoadingScene);
    game.start();
})().catch(console.error);
