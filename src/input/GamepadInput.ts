import { ControllerManager } from "./ControllerManager";
import { ControllerIntent } from "./ControllerIntent";
import { ControllerEventType } from "./ControllerEventType";
import { ControllerFamily } from "./ControllerFamily";
import { ControllerEvent } from "./ControllerEvent";

// TODO Possibily these constants are for XBox gamepads only...
enum GamePadButtonId {
    /** Button A */
    BUTTON_1 = 0,
    /** Button B */
    BUTTON_2 = 1,
    /** Button X */
    BUTTON_3 = 2,
    /** Button Y */
    BUTTON_4 = 3,
    SHOULDER_TOP_LEFT = 4,
    SHOULDER_TOP_RIGHT = 5,
    SHOULDER_BOTTOM_LEFT = 6,
    SHOULDER_BOTTOM_RIGHT = 7,
    SELECT = 8,
    START = 9,
    STICK_BUTTON_LEFT = 10,
    STICK_BUTTON_RIGHT = 11,
    D_PAD_UP = 12,
    D_PAD_DOWN = 13,
    D_PAD_LEFT = 14,
    D_PAD_RIGHT = 15,
    VENDOR = 16
}

enum StickAxisId {
    /** Left stick X axis */
    LEFT_LEFT_RIGHT = 0,
    /** Left stick Y axis */
    LEFT_UP_DOWN = 1,
    /** Right stick X axis */
    RIGHT_LEFT_RIGHT = 2,
    /** Right stick Y axis */
    RIGHT_UP_DOWN = 3
}

const axisMapping = new Map<number, {button1: number|undefined, button2: number|undefined}>();
axisMapping.set(StickAxisId.LEFT_LEFT_RIGHT, { button1: GamePadButtonId.D_PAD_LEFT, button2: GamePadButtonId.D_PAD_RIGHT });
axisMapping.set(StickAxisId.LEFT_UP_DOWN, { button1: GamePadButtonId.D_PAD_UP, button2: GamePadButtonId.D_PAD_DOWN });

const intentMappings = new Map<number, ControllerIntent[]>();
intentMappings.set(GamePadButtonId.D_PAD_UP, [ControllerIntent.MENU_UP]);
intentMappings.set(GamePadButtonId.D_PAD_DOWN, [ControllerIntent.PLAYER_DROP, ControllerIntent.MENU_DOWN]);
intentMappings.set(GamePadButtonId.D_PAD_LEFT, [ControllerIntent.PLAYER_MOVE_LEFT, ControllerIntent.MENU_LEFT]);
intentMappings.set(GamePadButtonId.D_PAD_RIGHT, [ControllerIntent.PLAYER_MOVE_RIGHT, ControllerIntent.MENU_RIGHT]);
intentMappings.set(GamePadButtonId.BUTTON_1, [ControllerIntent.PLAYER_JUMP, ControllerIntent.CONFIRM]);
intentMappings.set(GamePadButtonId.BUTTON_2, [ControllerIntent.ABORT]);
intentMappings.set(GamePadButtonId.BUTTON_3, [ControllerIntent.PLAYER_INTERACT]);
intentMappings.set(GamePadButtonId.SHOULDER_TOP_LEFT, [ControllerIntent.PLAYER_DANCE_1]);
intentMappings.set(GamePadButtonId.SHOULDER_TOP_RIGHT, [ControllerIntent.PLAYER_DANCE_2]);
intentMappings.set(GamePadButtonId.START, [ControllerIntent.PAUSE]);

const controllerFamily = ControllerFamily.GAMEPAD;

class GamepadButtonWrapper {
    public readonly index: number;
    private pressed: boolean;
    constructor(index: number, wrapped: GamepadButton) {
        this.index = index;
        this.pressed = wrapped.pressed;
    }
    public setPressed(pressed: boolean) {
        const controllerManager = ControllerManager.getInstance();
        const oldPressed = this.pressed;
        this.pressed = pressed;
        if (oldPressed != pressed) {
            if (pressed) {
                controllerManager.onButtonDown.emit(new ControllerEvent(controllerFamily, ControllerEventType.DOWN, intentMappings.get(this.index) || [ControllerIntent.NONE]));
            } else {
                controllerManager.onButtonUp.emit(new ControllerEvent(controllerFamily, ControllerEventType.UP, intentMappings.get(this.index) || [ControllerIntent.NONE]));
            }
        }
    }

}

class GamepadAxisWrapper {

    /**
     * Threshold to use to emulate virtual buttons.
     * Values between 0.1 (slight touches of the axis trigger button presses)
     * 0.9 (much force needed) can be used here.
     *
     * Avoid using 0.0 and 1.0 as they cannot be reached on some gamepads or
     * might lead to button flibber flubber...
     */
    private threshold = 0.3;

    public readonly index: number;
    private value: number = 0.0;

    constructor(index: number) {
        this.index = index;
    }
    public setValue(newValue: number) {
        const controllerManager = ControllerManager.getInstance();
        const oldValue = this.value;
        this.value = newValue;
        let emulatedButtonId: number|undefined = undefined;

        if (oldValue <= -this.threshold && newValue > -this.threshold) {
            // Virtual button 1 released
            emulatedButtonId = axisMapping.get(this.index)?.button1;
            if (emulatedButtonId != null) {
                controllerManager.onButtonDown.emit(new ControllerEvent(controllerFamily, ControllerEventType.UP, intentMappings.get(emulatedButtonId) || [ControllerIntent.NONE]));
            }
        } else if (oldValue > -this.threshold && newValue <= -this.threshold) {
            // Virtual button 1 pressed
            emulatedButtonId = axisMapping.get(this.index)?.button1;
            if (emulatedButtonId != null) {
                controllerManager.onButtonDown.emit(new ControllerEvent(controllerFamily, ControllerEventType.DOWN, intentMappings.get(emulatedButtonId) || [ControllerIntent.NONE]));
            }
        }

        if (oldValue > this.threshold && newValue <= this.threshold) {
            // Virtual button 2 released
            emulatedButtonId = axisMapping.get(this.index)?.button2;
            if (emulatedButtonId != null) {
                controllerManager.onButtonDown.emit(new ControllerEvent(controllerFamily, ControllerEventType.UP, intentMappings.get(emulatedButtonId) || [ControllerIntent.NONE]));
            }
        } else if (oldValue < this.threshold && newValue >= this.threshold) {
            // Virtual button 2 pressed
            emulatedButtonId = axisMapping.get(this.index)?.button2;
            if (emulatedButtonId != null) {
                controllerManager.onButtonDown.emit(new ControllerEvent(controllerFamily, ControllerEventType.DOWN, intentMappings.get(emulatedButtonId) || [ControllerIntent.NONE]));
            }
        }

    }
}

/**
 * Some obscure magic to make sure that gamepad buttons and axes are mapped
 * onto unified controller events.
 */
class GamepadWrapper {
    private index: number;
    private id: string;
    private buttons: GamepadButtonWrapper[];
    private axes: GamepadAxisWrapper[];
    constructor(gamepad: Gamepad) {
        this.index = gamepad.index;
        this.id = gamepad.id
        this.buttons = new Array(gamepad.buttons.length);
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i] = new GamepadButtonWrapper(i, gamepad.buttons[i]);
        }
        this.axes = new Array(gamepad.axes.length);
        for (let i = 0; i < this.axes.length; i++) {
            this.axes[i] = new GamepadAxisWrapper(i);
        }
    }
    update(): void {
        const gamepad = navigator.getGamepads()[this.index];
        if (gamepad != null) {
            this.buttons.forEach(button => button.setPressed(gamepad.buttons[button.index].pressed));
            this.axes.forEach(axis => axis.setValue(gamepad.axes[axis.index]));
        }
    }
    toString(): String {
        return `Gamepad (index: ${this.index}, id: ${this.id})`;
    }
}

export class GamepadInput {
    private gamepads: Map<string, GamepadWrapper>;
    constructor() {
        this.gamepads = new Map();
        window.addEventListener("gamepadconnected", (e: any) => {
            console.debug("Gamepad connected:", e);
            const gamepad = (e as GamepadEventInit).gamepad;
            if (gamepad != null) {
                this.gamepads.set(gamepad.id, new GamepadWrapper(gamepad));
            }
        });
        window.addEventListener("gamepaddisconnected", (e) => {
            console.debug("Gamepad disconnected:", e);
            const gamepad = (e as any as GamepadEventInit).gamepad;
            if (gamepad != null) {
                this.gamepads.delete(gamepad.id);
            }
        });
    }
    update(): void {
        this.gamepads.forEach(gamepad => gamepad.update());
    }
}
