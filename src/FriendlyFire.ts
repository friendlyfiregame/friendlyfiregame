import { Game } from './Game';
import { LoadingScene } from './scenes/LoadingScene';

export class FriendlyFire extends Game {
    public constructor() {
        super();
    }
}

const game = new FriendlyFire();
game.scenes.setScene(LoadingScene);
(window as any).game = game;
game.start();
