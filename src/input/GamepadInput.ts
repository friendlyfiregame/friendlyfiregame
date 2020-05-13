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

const buttonMapping = new Map<number, { code: string, key: string }>();
buttonMapping.set(GamePadButtonId.D_PAD_UP, { key: "ArrowUp", code: "ArrowUp" });
buttonMapping.set(GamePadButtonId.BUTTON_3, { key: " ", code: "Space" });
buttonMapping.set(GamePadButtonId.D_PAD_DOWN, { key: "ArrowDown", code: "ArrowDown" });
buttonMapping.set(GamePadButtonId.D_PAD_LEFT, { key: "ArrowLeft", code: "ArrowLeft" });
buttonMapping.set(GamePadButtonId.D_PAD_RIGHT, { key: "ArrowRight", code: "ArrowRight" });
buttonMapping.set(GamePadButtonId.BUTTON_1, { key: "Enter", code: "Enter" });
buttonMapping.set(GamePadButtonId.BUTTON_2, { key: "2", code: "Digit2" });
buttonMapping.set(GamePadButtonId.BUTTON_4, { key: "1", code: "Digit1" });
buttonMapping.set(GamePadButtonId.START, { key: "Escape", code: "Escape" });

/**
 * Special class to distinguish gamepad events from keyboard events.
 * Can be used in conjunction with the `instanceof` operator to check if any given
 * KeyboardEvent was created by a Gamepad or not.
 */
export class VirtualKeyboardEvent extends KeyboardEvent {
    constructor(type: string, eventInitDict?: KeyboardEventInit | undefined) {
        super(type, eventInitDict);
    }
}

class GamepadButtonWrapper {
    public readonly index: number;
    private pressed: boolean;
    constructor(index: number, wrapped: GamepadButton) {
        this.index = index;
        this.pressed = wrapped.pressed;
    }
    public setPressed(pressed: boolean) {
        const oldPressed = this.pressed;
        this.pressed = pressed;
        if (oldPressed != pressed) {
            const eventName = pressed ? "keydown" : "keyup";
            document.dispatchEvent(new VirtualKeyboardEvent(eventName, {
                key: buttonMapping.get(this.index)?.key,
                code: buttonMapping.get(this.index)?.code
            }));
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
    private threshold = 0.2;

    public readonly index: number;
    private value: number = 0.0;

    constructor(index: number) {
        this.index = index;
    }
    public setValue(newValue: number) {
        const oldValue = this.value;
        this.value = newValue;
        let emulatedButtonId: number|undefined = undefined;

        // Virtual button 1 released
        if (oldValue <= -this.threshold && newValue > -this.threshold) {
            emulatedButtonId = axisMapping.get(this.index)?.button1;
            if (emulatedButtonId != null) {
                document.dispatchEvent(new VirtualKeyboardEvent("keyup", {
                    key: buttonMapping.get(emulatedButtonId)?.key,
                    code: buttonMapping.get(emulatedButtonId)?.code,
                }));
            }
        }

        // Virtual button 2 released
        if (oldValue > this.threshold && newValue <= this.threshold) {
            emulatedButtonId = axisMapping.get(this.index)?.button2;
            if (emulatedButtonId != null) {
                document.dispatchEvent(new VirtualKeyboardEvent("keyup", {
                    key: buttonMapping.get(emulatedButtonId)?.key,
                    code: buttonMapping.get(emulatedButtonId)?.code
                }));
            }
        }

        // Virtual button 1 pressed
        if (oldValue > -this.threshold && newValue <= -this.threshold) {
            emulatedButtonId = axisMapping.get(this.index)?.button1;
            if (emulatedButtonId != null) {
                document.dispatchEvent(new VirtualKeyboardEvent("keydown", {
                    key: buttonMapping.get(emulatedButtonId)?.key,
                    code: buttonMapping.get(emulatedButtonId)?.code
                }));
            }
        }

        // Virtual button 2 pressed
        if (oldValue < this.threshold && newValue >= this.threshold) {
            emulatedButtonId = axisMapping.get(this.index)?.button2;
            if (emulatedButtonId != null) {
                document.dispatchEvent(new VirtualKeyboardEvent("keydown", {
                    key: buttonMapping.get(emulatedButtonId)?.key,
                    code: buttonMapping.get(emulatedButtonId)?.code
                }));
            }
        }

    }
}

/**
 * Some obscure magic to make sure that gamepad buttons and axes are mapped
 * onto key events.
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
        window.addEventListener("gamepaddisconnected", (e: any) => {
            console.debug("Gamepad disconnected:", e);
            const gamepad = (e as GamepadEventInit).gamepad;
            if (gamepad != null) {
                this.gamepads.delete(gamepad.id);
            }
        });
    }
    update(): void {
        this.gamepads.forEach(gamepad => gamepad.update());
    }
}
