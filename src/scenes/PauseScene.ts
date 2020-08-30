import { AppInfoJSON } from 'appinfo.json';
import { asset } from '../Assets';
import { BitmapFont } from '../BitmapFont';
import { ControllerEvent } from '../input/ControllerEvent';
import { ControlsScene } from './ControlsScene';
import { DIALOG_FONT } from '../constants';
import { Direction } from '../geometry/Direction';
import { easeOutBounce } from '../easings';
import { FriendlyFire } from '../FriendlyFire';
import { isDev } from '../util';
import { MenuItem, MenuList } from '../Menu';
import { Point } from '../geometry/Point';
import { Scene } from '../Scene';
import { Size } from '../geometry/Size';
import { SlideTransition } from '../transitions/SlideTransition';
import { Sound } from '../Sound';
import { TitleScene } from './TitleScene';

enum MenuItemKey {
    RESUME = 'resume',
    CONTROLS = 'controls',
    EXIT = 'exit'
}

export class PauseScene extends Scene<FriendlyFire> {
    @asset("music/pause.ogg")
    private static music: Sound;

    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    @asset("fonts/headline.font.json")
    private static headlineFont: BitmapFont;

    @asset("appinfo.json")
    private static appInfo: AppInfoJSON;

    private menu = new MenuList();

    public setup(): void {
        this.inTransition = new SlideTransition({ duration: 1, direction: Direction.UP, easing: easeOutBounce });
        this.outTransition = new SlideTransition({ duration: 0.25 });

        PauseScene.music.setLoop(true);
        PauseScene.music.setVolume(0.5);
        PauseScene.music.play();

        this.menu.setItems(
            new MenuItem(MenuItemKey.RESUME, "Resume", PauseScene.font, "white", new Point(75, 130)),
            new MenuItem(MenuItemKey.CONTROLS, "Controls and Options", PauseScene.font, "white", new Point(75, 145)),
            new MenuItem(MenuItemKey.EXIT, "Back to title", PauseScene.font, "white", new Point(75, 160)),
        )
    }

    public activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
        this.menu.onActivated.connect(this.handleMenuAction, this)
    }

    public deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
        this.menu.onActivated.disconnect(this.handleMenuAction, this);
    }

    public async handleMenuAction(buttonId: string): Promise<void> {
        switch(buttonId) {
            case MenuItemKey.RESUME:
                PauseScene.music.stop();
                this.scenes.popScene();
                break;
            case MenuItemKey.CONTROLS:
                this.game.scenes.pushScene(ControlsScene);
                break;
            case MenuItemKey.EXIT:
                PauseScene.music.stop();
                await this.game.scenes.popScene({ noTransition: true });
                this.game.scenes.setScene(TitleScene);
                break;
        }
    }

    private handleButtonDown(event: ControllerEvent): void {
        if (event.isAbort || event.isPause) {
            PauseScene.music.stop();
            this.scenes.popScene();
        } else if (event.isConfirm) {
            this.menu.executeAction();
        } else if (event.isMenuUp) {
            this.menu.prev();
        } else if (event.isMenuDown) {
            this.menu.next();
        }
    }

    public draw(ctx: CanvasRenderingContext2D, size: Size): void {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, size.width, size.height);

        PauseScene.headlineFont.drawText(ctx, 'GAME PAUSED', new Point(75, 100), 'white');

        const versionText = isDev() ? 'DEVELOPMENT VERSION' : PauseScene.appInfo.version;
        const versionTextSize = PauseScene.font.measureText(versionText);

        PauseScene.font.drawText(
            ctx,
            versionText,
            new Point(
                this.game.size.width - versionTextSize.width - 7,
                this.game.size.height - versionTextSize.height - 4
            ),
            'white',
            0,
            0.6
        );

        ctx.restore();

        this.menu.draw(ctx);
    }
}
