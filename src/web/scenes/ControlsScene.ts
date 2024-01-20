import { DIALOG_FONT } from "../../shared/constants";
import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { BitmapFont } from "../BitmapFont";
import { easeOutCubic } from "../easings";
import { type FriendlyFire } from "../FriendlyFire";
import { Direction } from "../geom/Direction";
import { type ControllerEvent } from "../input/ControllerEvent";
import { ControllerAnimationTags } from "../input/ControllerFamily";
import { ControllerManager } from "../input/ControllerManager";
import { Scene } from "../Scene";
import { AsepriteNode } from "../scene/AsepriteNode";
import { ControlTooltipNode } from "../scene/ControlTooltipNode";
import { ImageNode } from "../scene/ImageNode";
import { TextNode } from "../scene/TextNode";
import { SlideTransition } from "../transitions/SlideTransition";

export class ControlsScene extends Scene<FriendlyFire> {
    @asset(DIALOG_FONT)
    private static readonly font: BitmapFont;

    @asset("images/controls.png")
    private static readonly panelImage: HTMLImageElement;

    @asset("images/controls_keyboard.png")
    private static readonly keyboardKeys: HTMLImageElement;

    @asset("sprites/gamepad_selection.aseprite.json")
    private static readonly gamepadSelection: Aseprite;

    @asset("sprites/controls_gamepad.aseprite.json")
    private static readonly gamepadControls: Aseprite;

    private readonly controls: string[] = [
        "Walk",
        "Jump",
        "Interact",
        "Run",
        "Throw",
        "Enter doors",
        "Pause"
    ];

    private gamepadSelection!: AsepriteNode;
    private gamepadControls!: AsepriteNode;

    public override get urlFragment(): string {
        return "#controls";
    }

    public override setup(): void {
        this.setBackgroundStyle("rgba(0, 0, 0, 0.8)");
        this.zIndex = 2;
        this.inTransition = new SlideTransition({ duration: 0.5, direction: "top", easing: easeOutCubic });
        this.outTransition = new SlideTransition({ duration: 0.25 });

        const controllerManager = ControllerManager.getInstance();
        const gamepadStyle = controllerManager.currentGamepadStyle;

        this.gamepadSelection = new AsepriteNode({
            aseprite: ControlsScene.gamepadSelection,
            tag: controllerManager.autoDetectGamepadStyle ? "autodetect" : controllerManager.currentGamepadStyle,
            anchor: Direction.TOP_LEFT,
            x: 204,
            y: 2
        });

        this.gamepadControls = new AsepriteNode({
            aseprite: ControlsScene.gamepadControls,
            tag: gamepadStyle,
            anchor: Direction.TOP_LEFT,
            x: 206,
            y: 35
        });

        const panel = new ImageNode({
            image: ControlsScene.panelImage,
            x: this.game.width / 2,
            y: this.game.height / 2 - 16,
            childAnchor: Direction.TOP_LEFT
        }).appendChild(
            this.gamepadSelection
        ).appendChild(
            new ImageNode({
                image: ControlsScene.keyboardKeys,
                anchor: Direction.TOP_LEFT,
                x: 123,
                y: 35
            })
        ).appendChild(
            this.gamepadControls
        ).appendChild(
            new ControlTooltipNode({
                label: "Toggle Gamepad Button Prompts",
                control: ControllerAnimationTags.ACTION,
                anchor: Direction.TOP_LEFT,
                y: ControlsScene.panelImage.height + 2
            })
        ).appendChild(
            new ControlTooltipNode({
                label: "Back",
                control: ControllerAnimationTags.BACK,
                anchor: Direction.TOP_LEFT,
                y: ControlsScene.panelImage.height + 18
            })
        ).appendTo(this.rootNode);

        this.controls.forEach((label, index) => {
            panel.appendChild(new TextNode({
                font: ControlsScene.font,
                text: label,
                anchor: Direction.TOP_LEFT,
                x: 10,
                y: 35 + index * 20,
                color: "black"
            }));
        });
    }

    public override cleanup(): void {
        this.rootNode.clear();
    }

    public override activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
    }

    public override deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
    }

    private async handleButtonDown(event: ControllerEvent): Promise<void> {
        if (event.isAbort || event.isPause) {
            await this.scenes.popScene();
        } else if (event.isPlayerAction) {
            const controllerManager = ControllerManager.getInstance();
            controllerManager.toggleSelectedGamepadStyle();
            this.gamepadControls.setTag(controllerManager.currentGamepadStyle);
            this.gamepadSelection.setTag(controllerManager.autoDetectGamepadStyle ? "autodetect" : controllerManager.currentGamepadStyle);
        }
    }
}
