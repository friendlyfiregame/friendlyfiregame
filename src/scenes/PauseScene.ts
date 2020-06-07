import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { SlideTransition } from "../transitions/SlideTransition";
import { easeOutBounce } from "../easings";
import { BitmapFont } from "../BitmapFont";
import { asset } from "../Assets";
import { MenuList, MenuItem } from '../Menu';
import { ControlsScene } from './ControlsScene';
import { TitleScene } from "./TitleScene";
import { ControllerEvent } from "../input/ControllerEvent";
import { AppInfoJSON } from 'appinfo.json';

enum MenuItemKey {
    RESUME = 'resume',
    CONTROLS = 'controls',
    EXIT = 'exit'
}

export class PauseScene extends Scene<FriendlyFire> {
    @asset("fonts/standard.font.json")
    private static font: BitmapFont;

    @asset("fonts/headline.font.json")
    private static headlineFont: BitmapFont;

    @asset("appinfo.json")
    private static appInfo: AppInfoJSON;

    private menu = new MenuList();

    public setup(): void {
        this.inTransition = new SlideTransition({ duration: 1, direction: "top", easing: easeOutBounce });
        this.outTransition = new SlideTransition({ duration: 0.25 });

        this.menu.setItems(
            new MenuItem(MenuItemKey.RESUME, "Resume", PauseScene.font, "white", 75, 130),
            new MenuItem(MenuItemKey.CONTROLS, "Controls", PauseScene.font, "white", 75, 145),
            new MenuItem(MenuItemKey.EXIT, "Back to Title", PauseScene.font, "white", 75, 160),
        )
    }

    public activate(): void {
        this.controllerManager.onButtonDown.connect(this.handleButtonDown, this);
        this.menu.onActivated.connect(this.handleMenuAction, this)
    }

    public deactivate(): void {
        this.controllerManager.onButtonDown.disconnect(this.handleButtonDown, this);
        this.menu.onActivated.disconnect(this.handleMenuAction, this);
    }

    public async handleMenuAction (buttonId: string): Promise<void> {
        switch(buttonId) {
            case MenuItemKey.RESUME:
                this.scenes.popScene();
                break;
            case MenuItemKey.CONTROLS:
                this.game.scenes.pushScene(ControlsScene);
                break;
            case MenuItemKey.EXIT:
                await this.game.scenes.popScene({ noTransition: true });
                this.game.scenes.setScene(TitleScene);
                break;
        }
    }

    private handleButtonDown(event: ControllerEvent): void {
        if (event.isAbort || event.isPause) {
            this.scenes.popScene();
        } else if (event.isConfirm) {
            this.menu.executeAction();
        } else if (event.isMenuUp) {
            this.menu.prev();
        } else if (event.isMenuDown) {
            this.menu.next();
        }
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);
        PauseScene.headlineFont.drawText(ctx, 'GAME PAUSED', 75, 100, "white");
        const versionText = this.dev ? "DEVELOPMENT VERSION" : PauseScene.appInfo.version;
        const versionTextSize = PauseScene.font.measureText(versionText);
        PauseScene.font.drawText(ctx, versionText, this.game.width - versionTextSize.width - 4, this.game.height - versionTextSize.height - 4, "white", 0, 0.6);
        ctx.restore();
        this.menu.draw(ctx);
    }
}
