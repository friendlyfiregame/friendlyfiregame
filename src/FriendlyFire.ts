import { Game } from "./Game";
import { LoadingScene } from "./scenes/LoadingScene";
import { asset } from "./Assets";
import { Sound } from "./Sound";

export class FriendlyFire extends Game {
    @asset([
        "music/theme_01.mp3",
        "music/inferno.mp3"
    ])
    public static music: Sound[];

    public constructor() {
        super();
    }
}

const game = new FriendlyFire();
game.scenes.setScene(LoadingScene);
(window as any).game = game;
game.start();
