interface Button {
    pressed: boolean;
    touched: boolean;
    value: number;
}
export class VirtualGamepad extends Object implements Gamepad {

    readonly #index: number;
    readonly #connected: boolean;
    #timestamp: number;
    readonly #axes: number[];
    readonly #buttons: Button[];

    public constructor(initArgs: { index: number }) {
        super();
        this.#index = initArgs.index;
        this.#connected = true;
        this.#timestamp = Date.now();
        this.#axes = Array(4) as number[];
        for (let i = 0; i < this.#axes.length; i++) {
            this.#axes[i] = 0.0;
        }

        this.#buttons = Array(17) as Button[];
        for (let i = 0; i < this.#buttons.length; i++) {
            this.#buttons[i] = {
                pressed: false,
                touched: false,
                value: 0.0
            };
        }
    }

    public pressButton(index: number): void {
        this.#timestamp = Date.now();
        this.#buttons[index].pressed = true;
        this.#buttons[index].touched = false;
        this.#buttons[index].value = 1;
    }

    public releaseButton(index: number): void {
        this.#timestamp = Date.now();
        this.#buttons[index].pressed = false;
        this.#buttons[index].touched = false;
        this.#buttons[index].value = 0;
    }

    public get axes(): number[] {
        return this.#axes;
    }

    public get buttons(): GamepadButton[] {
        return this.#buttons;
    }

    public get connected(): boolean {
        return this.#connected;
    }

    public get hapticActuators(): GamepadHapticActuator[] {
        return [];
    }

    public get id(): string {
        return "Cat Hive Virtual Touch Controller";
    }

    public get index(): number {
        return this.#index;
    }

    public get mapping(): GamepadMappingType {
        return "standard";
    }

    public get timestamp(): number {
        return this.#timestamp;
    }

    public get vibrationActuator(): null {
        return null;
    }

}
