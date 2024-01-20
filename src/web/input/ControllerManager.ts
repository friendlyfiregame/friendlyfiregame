import { Signal } from "../Signal";
import { type ControllerEvent, GamepadControllerEvent } from "./ControllerEvent";
import { ControllerFamily, ControllerSpriteMap } from "./ControllerFamily";
import { DEFAULT_GAMEPAD_STYLE, GamepadStyle } from "./GamepadStyle";

export class ControllerManager {
    static readonly #INSTANCE = new ControllerManager();

    public static getInstance(): ControllerManager {
        return ControllerManager.#INSTANCE;
    }

    public readonly onButtonDown = new Signal<ControllerEvent>();
    public readonly onButtonUp = new Signal<ControllerEvent>();
    public readonly onButtonPress = new Signal<ControllerEvent>();
    public readonly onControllerFamilyChange = new Signal<ControllerFamily>();
    public readonly onGamepadStyleChange = new Signal<GamepadStyle>();

    #currentGamepadStyle = DEFAULT_GAMEPAD_STYLE;
    #currentGamepadStyleOverride = DEFAULT_GAMEPAD_STYLE;

    public set currentGamepadStyleOverride(gamepadStyleOverride: GamepadStyle) {
        const oldGamepadStyle = this.currentGamepadStyle;
        this.#currentGamepadStyleOverride = gamepadStyleOverride;
        if (this.currentGamepadStyle !== oldGamepadStyle) {
            this.onGamepadStyleChange.emit(this.currentGamepadStyle);
        }
    }

    public get currentGamepadStyle(): GamepadStyle {
        return this.autoDetectGamepadStyle ? this.#currentGamepadStyle : this.#currentGamepadStyleOverride;
    }

    #autoDetectGamepadStyle = true;

    /**
     * Set to true to automatically set the current gamepad style from the
     * last used input device.
     */
    public set autoDetectGamepadStyle(autodetectGamepadStyle: boolean) {
        const oldGamepadStyle = this.currentGamepadStyle;
        this.#autoDetectGamepadStyle = autodetectGamepadStyle;
        if (this.currentGamepadStyle !== oldGamepadStyle) {
            this.onGamepadStyleChange.emit(this.currentGamepadStyle);
        }
    }

    public get autoDetectGamepadStyle(): boolean {
        return this.#autoDetectGamepadStyle;
    }

    #currentControllerFamily: ControllerFamily = ControllerFamily.KEYBOARD;

    private constructor(initialControllerFamily: ControllerFamily = ControllerFamily.KEYBOARD) {
        this.currentControllerFamily = initialControllerFamily;

        this.onButtonDown.connect(e => {
            if (this.#currentControllerFamily !== e.controllerFamily) {
                this.currentControllerFamily = e.controllerFamily;
            }
            if (e instanceof GamepadControllerEvent) {
                if (this.#currentGamepadStyle !== e.gamepadModel.style) {
                    const oldGamepadStyle = this.currentGamepadStyle;
                    this.#currentGamepadStyle = e.gamepadModel.style;
                    if (this.currentGamepadStyle !== oldGamepadStyle) {
                        this.onGamepadStyleChange.emit(this.currentGamepadStyle);
                    }
                }
            }
        });
    }

    public set currentControllerFamily(controllerFamily: ControllerFamily) {
        if (controllerFamily !== this.currentControllerFamily) {
            this.#currentControllerFamily = controllerFamily;
            this.onControllerFamilyChange.emit(this.currentControllerFamily);
        }
    }

    /**
     * Returns the current (a.k.a. most recently used!) controller family.
     * Can be used to determine which tooltips (gamepad buttons or keyboard indicators) to show.
     */
    public get currentControllerFamily(): ControllerFamily {
        return this.#currentControllerFamily;
    }

    public toggleSelectedGamepadStyle(): void {
        if (this.autoDetectGamepadStyle) {
            this.autoDetectGamepadStyle = false;
            this.currentGamepadStyleOverride = GamepadStyle.XBOX;
        } else {
            switch (this.#currentGamepadStyleOverride) {
                case GamepadStyle.XBOX:
                    this.currentGamepadStyleOverride = GamepadStyle.PLAYSTATION;
                    break;
                case GamepadStyle.PLAYSTATION:
                    this.currentGamepadStyleOverride = GamepadStyle.STADIA;
                    break;
                case GamepadStyle.STADIA:
                    this.currentGamepadStyleOverride = GamepadStyle.XBOX;
                    this.autoDetectGamepadStyle = true;
                    break;
                default:
                    // Nothing to do
            }
        }
    }

    public get controllerSprite(): ControllerSpriteMap {
        if (this.currentControllerFamily === ControllerFamily.GAMEPAD) {
            switch (this.currentGamepadStyle) {
                case GamepadStyle.PLAYSTATION:
                    return ControllerSpriteMap.PLAYSTATION;
                case GamepadStyle.XBOX:
                    return ControllerSpriteMap.XBOX;
                case GamepadStyle.STADIA:
                    return ControllerSpriteMap.STADIA;
                default:
                    // Nothing to do
            }
        }

        // Fallback to Keyboard
        return ControllerSpriteMap.KEYBOARD;
    }
}
