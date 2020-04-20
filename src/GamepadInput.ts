// TODO Possibily these constants are for XBox gamepads only...
export enum GamePadButtonId {
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

export enum StickAxisIds {
    /** Left stick X axis */
    LEFT_LEFT_RIGHT = 0,
    /** Left stick Y axis */
    LEFT_UP_DOWN = 1,
    /** Right stick X axis */
    RIGHT_LEFT_RIGHT = 2,
    /** Right stick Y axis */
    RIGHT_UP_DOWN = 3
}

const buttonMapping = new Map<number, string>();
buttonMapping.set(GamePadButtonId.D_PAD_UP, "ArrowUp");
buttonMapping.set(GamePadButtonId.BUTTON_3, "ArrowUp");
buttonMapping.set(GamePadButtonId.D_PAD_DOWN, "ArrowDown");
buttonMapping.set(GamePadButtonId.D_PAD_LEFT, "ArrowLeft");
buttonMapping.set(GamePadButtonId.D_PAD_RIGHT, "ArrowRight");
buttonMapping.set(GamePadButtonId.BUTTON_1, "Enter");
buttonMapping.set(GamePadButtonId.SHOULDER_TOP_LEFT, "o");
buttonMapping.set(GamePadButtonId.SHOULDER_TOP_RIGHT, "i");
buttonMapping.set(GamePadButtonId.SHOULDER_BOTTOM_RIGHT, "t");


class GamepadButtonWrapper {
    public index: number;
    public pressed: boolean;
    constructor(index: number, wrapped: GamepadButton) {
        this.index = index;
        this.pressed = wrapped.pressed;
    }
    public setPressed(pressed: boolean) {
        const oldPressed = this.pressed;
        this.pressed = pressed;
        if (oldPressed != pressed) {
            const eventName = pressed ? "keydown" : "keyup";
            document.dispatchEvent(new KeyboardEvent(eventName, {
                key: buttonMapping.get(this.index)
            }));
        }
    }

}

class GamepadWrapper {
    public index: number;
    public id: string;
    private buttons: GamepadButtonWrapper[];
    constructor(gamepad: Gamepad) {
        this.index = gamepad.index;
        this.id = gamepad.id
        this.buttons = new Array(gamepad.buttons.length);
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i] = new GamepadButtonWrapper(i, gamepad.buttons[i]);
        }
    }
    update(): void {
        const gamepad = navigator.getGamepads()[this.index];
        if (gamepad != null) {
            this.buttons.forEach(button => {
                const pressed = gamepad.buttons[button.index].pressed;
                button.setPressed(pressed);
            });
        }
    }
}

export class GamepadInput {
    private gamepads: Map<string, GamepadWrapper>;
    constructor() {
        this.gamepads = new Map();
        if (typeof navigator.getGamepads === "function") {
            console.info("Initializing Gamepad input...");
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
        } else {
            console.info("Gamepads are not supported in your browser.");
        }
    }
    update(): void {
        this.gamepads.forEach(gamepad => gamepad.update());
    }
}
