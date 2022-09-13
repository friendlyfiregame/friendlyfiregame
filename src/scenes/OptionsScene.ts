import { asset } from "../Assets";
import { DIALOG_FONT } from "../constants";
import { easeOutCubic } from "../easings";
import { FriendlyFire } from "../FriendlyFire";
import { Scene } from "../Scene";
import { SlideTransition } from "../transitions/SlideTransition";
import { ImageNode } from "../scene/ImageNode";
import { Direction } from "../geom/Direction";
import { ControllerEvent } from "../input/ControllerEvent";
import { TextNode } from "../scene/TextNode";
import { BitmapFont } from "../BitmapFont";
import { MenuItem, MenuList } from "../Menu";
import { ControlTooltipNode } from "../scene/ControlTooltipNode";
import { ControllerAnimationTags } from "../input/ControllerFamily";

enum MenuItemKey {
    FULLSCREEN = "fullscreen",
}


export class OptionsScene extends Scene<FriendlyFire> {
    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    @asset("fonts/credits.font.json")
    private static headlineFont: BitmapFont;

    @asset("images/credits.png")
    private static panelImage: HTMLImageElement;

    private menu!: MenuList;

    public setup(): void {
        const menuItemX = 12;
        const menuItemY = 20;
        this.setBackgroundStyle("rgba(0, 0, 0, 0.8)");
        this.zIndex = 2;
        this.inTransition = new SlideTransition({ duration: 0.5, direction: "top", easing: easeOutCubic });
        this.outTransition = new SlideTransition({ duration: 0.25 });

        const panel = new ImageNode({
            image: OptionsScene.panelImage,
            x: this.game.width / 2,
            y: this.game.height / 2 - 16,
            childAnchor: Direction.TOP_LEFT
        }).appendChild(
            new TextNode({
                font: OptionsScene.headlineFont,
                text: "OPTIONS",
                anchor: Direction.BOTTOM_LEFT,
                y: -5,
                color: "white"
            })
        ).appendChild(
            new ControlTooltipNode({
                label: "Change",
                control: ControllerAnimationTags.CONFIRM,
                anchor: Direction.TOP_LEFT,
                y: OptionsScene.panelImage.height + 2
            })
        ).appendChild(
            new ControlTooltipNode({
                label: "Back",
                control: ControllerAnimationTags.BACK,
                anchor: Direction.TOP_LEFT,
                y: OptionsScene.panelImage.height + 18
            })
        ).appendTo(this.rootNode);

        this.menu = new MenuList().setItems(
            new MenuItem(
                MenuItemKey.FULLSCREEN, "Toggle Fullscreen", OptionsScene.font, "black", menuItemX, menuItemY
            )
        );

        this.menu.appendTo(panel);
    }

    public async handleMenuAction(buttonId: string): Promise<void> {
        switch (buttonId) {
            case MenuItemKey.FULLSCREEN:
                this.toggleFullscreen();
                break;
        }
    }

    private async toggleFullscreen (): Promise<boolean> {
        const enabled = !(await this.game.displayManager.isFullscreenEnabled());
        await this.game.displayManager.setFullscreenEnabled(enabled);
        return enabled;
    }

    public cleanup(): void {
        this.rootNode.clear();
    }

    public activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
        this.menu.onActivated.connect(this.handleMenuAction, this);
    }

    public deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
        this.menu.onActivated.disconnect(this.handleMenuAction, this);
    }

    private async handleButtonDown(event: ControllerEvent): Promise<void> {
        if (event.isAbort) {
            this.scenes.popScene();
        } else if (event.isConfirm) {
            this.menu.executeAction();
        } else if (event.isMenuUp) {
            this.menu.prev();
        } else if (event.isMenuDown) {
            this.menu.next();
        }
    }
}
