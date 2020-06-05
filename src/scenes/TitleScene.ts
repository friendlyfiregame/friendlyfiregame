import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { asset } from "../Assets";
import { FadeTransition } from "../transitions/FadeTransition";
import { CurtainTransition } from "../transitions/CurtainTransition";
import { easeInSine } from "../easings";
import { BitmapFont } from "../BitmapFont";
import { GameScene } from "./GameScene";
import { ControlsScene } from "./ControlsScene";
import { MenuList, MenuItem } from '../Menu';
import { isElectron } from "../util";
import { ControllerEvent } from "../input/ControllerEvent";

const credits = "Friendly Fire is a contribution to Ludum Dare Game Jam Contest #46. " +
    "Created by Eduard But, Nico Huelscher, Benjamin Jung, Nils Kreutzer, Bastian Lang, Ranjit Mevius, Markus Over, " +
    "Klaus Reimer and Jennifer van Veen, within 72 hours.";

enum MenuItemKey {
    START = 'start',
    CONTROLS = 'controls',
    CREDITS = 'credits',
    EXIT = 'exit'
}

export class TitleScene extends Scene<FriendlyFire> {
    @asset("images/title.png")
    private static titleImage: HTMLImageElement;

    @asset("fonts/standard.font.json")
    private static font: BitmapFont;

    private time: number = 0;
    private menu = new MenuList();

    public setup(): void {
        this.zIndex = 1;
        this.inTransition = new FadeTransition();
        this.outTransition = new CurtainTransition({ easing: easeInSine });
        this.menu.setItems(
            new MenuItem(MenuItemKey.START, "Start Game", TitleScene.font, "white", 75, 160),
            new MenuItem(MenuItemKey.CONTROLS, "Controls", TitleScene.font, "white", 75, 175),
            new MenuItem(MenuItemKey.CREDITS, "Credits", TitleScene.font, "white", 75, 190),
        )
        if (isElectron() || window.opener) {
            this.menu.addItems(
                new MenuItem(MenuItemKey.EXIT, "Exit", TitleScene.font, "white", 75, 205)
            );
        }
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
                console.log('TODO: show credits')
                break;
            case MenuItemKey.EXIT:
                window.close();
                break;
        }
    }

    public activate(): void {
        this.controllerManager.onButtonDown.connect(this.handleButtonDown, this);
        this.menu.onActivated.connect(this.handleMenuAction, this)
        this.playMusicTrack();
    }

    public deactivate(): void {
        this.controllerManager.onButtonDown.disconnect(this.handleButtonDown, this);
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
        const off = (this.time * 1000 / 12) % 2000;
        const cx = Math.round(width + 100 - off);
        TitleScene.font.drawText(ctx, credits, cx, ctx.canvas.height - 20, "white", 0);
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
