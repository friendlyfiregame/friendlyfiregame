import { DIALOG_FONT } from "../../shared/constants";
import { asset } from "../Assets";
import { AudioManager } from "../audio/AudioManager";
import { SoundChannel } from "../audio/SoundChannel";
import { BitmapFont } from "../BitmapFont";
import type { DisplayManager} from "../DisplayManager";
import { RenderMode } from "../DisplayManager";
import { easeOutCubic } from "../easings";
import type { FriendlyFire } from "../FriendlyFire";
import { Direction } from "../geom/Direction";
import type { ControllerEvent } from "../input/ControllerEvent";
import { ControllerAnimationTags } from "../input/ControllerFamily";
import { MenuItem, MenuList, SelectMenuItem, SliderMenuItem } from "../Menu";
import { Scene } from "../Scene";
import { ControlTooltipNode } from "../scene/ControlTooltipNode";
import { ImageNode } from "../scene/ImageNode";
import { TextNode } from "../scene/TextNode";
import { SlideTransition } from "../transitions/SlideTransition";
import { isDev } from "../util";

enum MenuItemKey {
    FULLSCREEN = "fullscreen",
    RENDER_MODE = "render-mode",
    SFX_SLIDER = "sfxSlider",
    MUSIC_SLIDER = "musicSlider",
}


export class OptionsScene extends Scene<FriendlyFire> {
    @asset(DIALOG_FONT)
    private static readonly font: BitmapFont;

    @asset("fonts/credits.font.json")
    private static readonly headlineFont: BitmapFont;

    @asset("images/credits.png")
    private static readonly panelImage: HTMLImageElement;

    private menu!: MenuList;

    #audioManager!: AudioManager;
    public get audioManager(): AudioManager {
        return this.#audioManager;
    }

    public override get urlFragment(): string {
        return "#options";
    }

    public override setup(): void {
        const menuItemX = 12;
        const menuItemY = 20;
        this.setBackgroundStyle("rgba(0, 0, 0, 0.8)");
        this.zIndex = 2;
        this.inTransition = new SlideTransition({ duration: 0.5, direction: "top", easing: easeOutCubic });
        this.outTransition = new SlideTransition({ duration: 0.25 });

        this.#audioManager = AudioManager.getInstance();

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
            ),
            new SelectMenuItem(
                {
                    id: MenuItemKey.RENDER_MODE,
                    label: "Render Mode",
                    font: OptionsScene.font,
                    color: "black",
                    x: menuItemX,
                    y: menuItemY + 20,
                    enabled: true,
                    initialValue: this.game.displayManager.getRenderMode(),
                    values: Object.values(RenderMode).filter(v => v !== RenderMode.NATIVE || isDev()),
                    valueLabels: {
                        [ RenderMode.PIXEL_IMPERFECT ]: "Pixel Imperfect",
                        [ RenderMode.PIXEL_PERFECT ]: "Pixel Perfect",
                        [ RenderMode.NATIVE ]: "Native (Experimental)",
                    },
                    actionCallback: this.handleRenderModeChange,
                    data: { displayManager: this.game.displayManager }
                }
            ),
            new SliderMenuItem(
                {
                    id: MenuItemKey.SFX_SLIDER,
                    label: "SFX Volume",
                    font: OptionsScene.font,
                    color: "black",
                    x: menuItemX,
                    y: menuItemY + 40,
                    enabled: true,
                    initialValue: Math.round(this.audioManager.sfxGain * 100),
                    minValue: 0,
                    maxValue: 100,
                    increment: 10,
                    leftActionCallback: this.handleAudioSliderChange,
                    rightActionCallback: this.handleAudioSliderChange,
                    data: { channel: SoundChannel.SFX, audioManager: this.#audioManager }
                }
            ),
            new SliderMenuItem(
                {
                    id: MenuItemKey.MUSIC_SLIDER,
                    label: "Music Volume",
                    font: OptionsScene.font,
                    color: "black",
                    x: menuItemX,
                    y: menuItemY + 60,
                    enabled: true,
                    initialValue: Math.round(this.audioManager.musicGain * 100),
                    minValue: 0,
                    maxValue: 100,
                    increment: 10,
                    leftActionCallback: this.handleAudioSliderChange,
                    rightActionCallback: this.handleAudioSliderChange,
                    data: { channel: SoundChannel.MUSIC, audioManager: this.#audioManager }
                }
            )
        );
        this.menu.appendTo(panel);
    }

    private handleRenderModeChange(newValue: RenderMode, data: { displayManager: DisplayManager }): void {
        data.displayManager.setRenderMode(newValue);
    }

    private handleAudioSliderChange(newValue: number, data: { channel: SoundChannel, audioManager: AudioManager }): void {
        newValue = newValue / 100;
        if (data.channel === SoundChannel.MUSIC) {
            data.audioManager.musicGain = newValue;
        } else if (data.channel === SoundChannel.SFX) {
            data.audioManager.sfxGain = newValue;
        } else {
            throw new Error(`Unknown sound channel: ${data.channel as string}.`);
        }
    }

    public async handleMenuAction(buttonId: string): Promise<void> {
        if (buttonId === MenuItemKey.FULLSCREEN) {
            await this.toggleFullscreen();
        }
    }

    private async toggleFullscreen(): Promise<boolean> {
        const enabled = !(await this.game.displayManager.isFullscreenEnabled());
        await this.game.displayManager.setFullscreenEnabled(enabled);
        return enabled;
    }

    public override cleanup(): void {
        this.rootNode.clear();
    }

    public override activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
        this.menu.onActivated.connect(this.handleMenuAction, this);
        // this.menu.onLeftAction.connect(this.handleMenuLeftAction, this);
        // this.menu.onRightAction.connect(this.handleMenuRightAction, this);
    }

    public override deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
        this.menu.onActivated.disconnect(this.handleMenuAction, this);
        // this.menu.onLeftAction.disconnect(this.handleMenuLeftAction, this);
        // this.menu.onRightAction.disconnect(this.handleMenuRightAction, this);
    }

    private async handleButtonDown(event: ControllerEvent): Promise<void> {
        if (event.isAbort) {
            await this.scenes.popScene();
        } else if (event.isConfirm) {
            this.menu.executeAction();
        } else if (event.isMenuUp) {
            this.menu.prev();
        } else if (event.isMenuDown) {
            this.menu.next();
        } else if (event.isMenuRight) {
            this.menu.executeRightAction();
        } else if (event.isMenuLeft) {
            this.menu.executeLeftAction();
        }
    }
}
