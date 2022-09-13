import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { BitmapFont } from "../BitmapFont";
import { ControllerAnimationTags } from "../input/ControllerFamily";
import { ControllerEvent } from "../input/ControllerEvent";
import { ControllerManager } from "../input/ControllerManager";
import { DIALOG_FONT } from "../constants";
import { easeOutCubic } from "../easings";
import { FriendlyFire } from "../FriendlyFire";
import { Scene } from "../Scene";
import { SlideTransition } from "../transitions/SlideTransition";
import { ImageNode } from "../scene/ImageNode";
import { AsepriteNode } from "../scene/AsepriteNode";
import { Direction } from "../geom/Direction";
import { TextNode } from "../scene/TextNode";
import { ControlTooltipNode } from "../scene/ControlTooltipNode";

export class ControlsScene extends Scene<FriendlyFire> {
    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    @asset("images/controls.png")
    private static panelImage: HTMLImageElement;

    @asset("images/controls_keyboard.png")
    private static keyboardKeys: HTMLImageElement;

    @asset("images/gamepad_selection.aseprite.json")
    private static gamepadSelection: Aseprite;

    @asset("images/controls_gamepad.aseprite.json")
    private static gamepadControls: Aseprite;

    private controls: string[] = [
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

    public setup(): void {
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

    public cleanup(): void {
        this.rootNode.clear();
    }

    public activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
    }

    public deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
    }

    private handleButtonDown(event: ControllerEvent): void {
        if (event.isAbort || event.isPause) {
            this.scenes.popScene();
        } else if (event.isPlayerAction) {
            const controllerManager = ControllerManager.getInstance();
            controllerManager.toggleSelectedGamepadStyle();
            this.gamepadControls.setTag(controllerManager.currentGamepadStyle);
            this.gamepadSelection.setTag(controllerManager.autoDetectGamepadStyle ? "autodetect" : controllerManager.currentGamepadStyle);
        }
    }
}
