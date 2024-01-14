import { AppInfoJSON } from "appinfo.json";
import { asset } from "../Assets";
import { BitmapFont } from "../BitmapFont";
import { ControllerEvent } from "../input/ControllerEvent";
import { ControlsScene } from "./ControlsScene";
import { DIALOG_FONT } from "../../shared/constants";
import { easeOutBounce } from "../easings";
import { FriendlyFire } from "../FriendlyFire";
import { isDev } from "../util";
import { MenuItem, MenuList } from "../Menu";
import { Scene } from "../Scene";
import { SlideTransition } from "../transitions/SlideTransition";
import { Sound } from "../audio/Sound";
import { TitleScene } from "./TitleScene";
import { TextNode } from "../scene/TextNode";
import { Direction } from "../geom/Direction";
import { OptionsScene } from "./OptionsScene";

enum MenuItemKey {
    RESUME = "resume",
    CONTROLS = "controls",
    OPTIONS = "options",
    EXIT = "exit"
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

    private menu!: MenuList;

    public override cleanup(): void {
        this.rootNode.clear();
    }

    public override get urlFragment(): string {
        return "#pause";
    }

    public override setup(): void {
        this.setBackgroundStyle("rgba(0, 0, 0, 0.8)");

        this.inTransition = new SlideTransition({ duration: 1, direction: "top", easing: easeOutBounce });
        this.outTransition = new SlideTransition({ duration: 0.25 });

        PauseScene.music.setLoop(true);
        PauseScene.music.setVolume(0.5);
        PauseScene.music.play();

        new TextNode({
            font: PauseScene.headlineFont,
            text: "GAME PAUSED",
            color: "white",
            anchor: Direction.TOP_LEFT,
            x: 75,
            y: 100
        }).appendTo(this.rootNode);

        new TextNode({
            font: PauseScene.font,
            text: isDev() ? "DEVELOPMENT VERSION" : PauseScene.appInfo.version,
            color: "white",
            anchor: Direction.BOTTOM_RIGHT,
            x: this.game.width - 7,
            y: this.game.height - 4,
            opacity: 0.6
        }).appendTo(this.rootNode);

        this.menu = new MenuList().appendTo(this.rootNode).setItems(
            new MenuItem(MenuItemKey.RESUME, "Resume", PauseScene.font, "white", 75, 130),
            new MenuItem(MenuItemKey.CONTROLS, "Controls", PauseScene.font, "white", 75, 145),
            new MenuItem(MenuItemKey.OPTIONS, "Options", PauseScene.font, "white", 75, 160),
            new MenuItem(MenuItemKey.EXIT, "Back to title", PauseScene.font, "white", 75, 175),
        );
    }

    public override activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
        this.menu.onActivated.connect(this.handleMenuAction, this);
    }

    public override deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
        this.menu.onActivated.disconnect(this.handleMenuAction, this);
    }

    public async handleMenuAction(buttonId: string): Promise<void> {
        switch (buttonId) {
            case MenuItemKey.RESUME:
                PauseScene.music.stop();
                await this.scenes.popScene();
                break;
            case MenuItemKey.CONTROLS:
                await this.game.scenes.pushScene(ControlsScene);
                break;
            case MenuItemKey.OPTIONS:
                await this.game.scenes.pushScene(OptionsScene);
                break;
            case MenuItemKey.EXIT:
                PauseScene.music.stop();
                await this.game.scenes.popScene({ noTransition: true });
                await this.game.scenes.setScene(TitleScene);
                break;
        }
    }

    private async handleButtonDown(event: ControllerEvent): Promise<void> {
        if (event.isAbort || event.isPause) {
            PauseScene.music.stop();
            await this.scenes.popScene();
        } else if (event.isConfirm) {
            this.menu.executeAction();
        } else if (event.isMenuUp) {
            this.menu.prev();
        } else if (event.isMenuDown) {
            this.menu.next();
        }
    }
}
