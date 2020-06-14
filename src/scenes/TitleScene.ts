import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { asset } from "../Assets";
import { FadeTransition } from "../transitions/FadeTransition";
import { CurtainTransition } from "../transitions/CurtainTransition";
import { easeInSine } from "../easings";
import { BitmapFont } from "../BitmapFont";
import { GameScene } from "./GameScene";
import { ControlsScene } from "./ControlsScene";
import { MenuList, MenuItem, MenuAlignment } from '../Menu';
import { isElectron } from "../util";
import { ControllerEvent } from "../input/ControllerEvent";
import { CreditsScene } from './CreditsScene';
import { Aseprite } from '../Aseprite';

type MainMenuParams = {
    label: string;
    electronOnly?: boolean;
}

enum MenuItemKey {
    START = 'start',
    CONTROLS = 'controls',
    CREDITS = 'credits',
    EXIT = 'exit'
}

const MenuLabels: Record<MenuItemKey, MainMenuParams> = {
    [MenuItemKey.START]: { label: "Start Game" },
    [MenuItemKey.CONTROLS]: { label: "Controls" },
    [MenuItemKey.CREDITS]: { label: "Credits" },
    [MenuItemKey.EXIT]: { label: "Exit Game", electronOnly: true },
};

export class TitleScene extends Scene<FriendlyFire> {
    @asset("images/title.png")
    private static titleImage: HTMLImageElement;

    @asset("images/logo.png")
    private static logoImage: HTMLImageElement;

    @asset("sprites/flameicon.aseprite.json")
    private static flameicon: Aseprite;

    @asset("fonts/standard.font.json")
    private static font: BitmapFont;

    private menu = new MenuList(MenuAlignment.CENTER);
    private time = 0;

    private titleBasePosition = {
        x: this.game.width / 2 - TitleScene.logoImage.width / 2,
        y: 60
    }

    private menuBasePosition = {
        x: this.game.width / 2,
        y: 190,
        gap: 15,
    }


    public setup(): void {
        this.zIndex = 1;
        this.time = 0;
        this.inTransition = new FadeTransition();
        this.outTransition = new CurtainTransition({ easing: easeInSine });

        Object.values(MenuItemKey).forEach((key, index) => {
            if (!MenuLabels[key].electronOnly || (isElectron() || window.opener)) {
                this.menu.addItems(
                    new MenuItem(key, MenuLabels[key].label, TitleScene.font, "white", this.menuBasePosition.x, this.menuBasePosition.y + this.menuBasePosition.gap * index)
                );
            }
        });
    }

    public handleMenuAction (buttonId: string) {
        switch(buttonId) {
            case MenuItemKey.START:
                this.game.scenes.setScene(GameScene);
                break;
            case MenuItemKey.CONTROLS:
                this.game.scenes.pushScene(ControlsScene);
                break;
            case MenuItemKey.CREDITS:
                this.game.scenes.pushScene(CreditsScene);
                break;
            case MenuItemKey.EXIT:
                window.close();
                break;
        }
    }

    public activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
        this.menu.onActivated.connect(this.handleMenuAction, this)
        this.playMusicTrack();
    }

    public deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
        this.menu.onActivated.disconnect(this.handleMenuAction, this);
    }

    private handleButtonDown(event: ControllerEvent): void {
        if (event.isConfirm) {
            this.menu.executeAction();
        } else if (event.isMenuUp) {
            this.menu.prev();
        } else if (event.isMenuDown) {
            this.menu.next();
        }
    }

    public update(dt: number) {
        this.time += dt;
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();
        ctx.beginPath();
        ctx.drawImage(TitleScene.titleImage, 0, 0);
        ctx.drawImage(TitleScene.logoImage, this.titleBasePosition.x, this.titleBasePosition.y);
        TitleScene.flameicon.drawTag(ctx, "idle", this.titleBasePosition.x + 147, this.titleBasePosition.y - 10, this.time * 1000);
        ctx.restore();
        this.menu.draw(ctx);
    }

    private playMusicTrack(): void {
        const music = FriendlyFire.music[0];
        FriendlyFire.music.forEach(music => music.stop());
        music.setLoop(true);
        music.setVolume(0.25);
        FriendlyFire.music[1].setVolume(0.25);
        music.play();
    }
}
