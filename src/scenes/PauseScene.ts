import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { SlideTransition } from "../transitions/SlideTransition";
import { easeOutBounce } from "../easings";
import { BitmapFont } from "../BitmapFont";
import { asset } from "../Assets";
import { MenuList, MenuItem } from '../Menu';
import { ControlsScene } from './ControlsScene';
import { TitleScene } from './TitleScene';

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
        this.keyboard.onKeyDown.connect(this.handleKeyDown, this);
        this.menu.onActivated.connect(this.handleMenuAction, this)
    }

    public deactivate(): void {
        this.keyboard.onKeyDown.disconnect(this.handleKeyDown, this);
        this.menu.onActivated.disconnect(this.handleMenuAction, this);
    }

    public handleMenuAction (buttonId: string) {
        switch(buttonId) {
            case MenuItemKey.RESUME:
                this.scenes.popScene();
                break;
            case MenuItemKey.CONTROLS:
                this.game.scenes.pushScene(ControlsScene);
                break;
            case MenuItemKey.EXIT:
                console.log('TODO: exit to main menu');
                break;
        }
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (event.code === "Escape") {
            this.scenes.popScene();
        } else if (event.code === "Enter" || event.key === "e") {
            this.menu.executeAction();
        } else if (event.key === "w" || event.key === "ArrowUp") {
            this.menu.prev();
        } else if (event.key === "s" || event.key === "ArrowDown") {
            this.menu.next();
        }
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);
        PauseScene.headlineFont.drawText(ctx, 'GAME PAUSED', 75, 100, "white");
        ctx.restore();
        this.menu.draw(ctx);
    }
}
