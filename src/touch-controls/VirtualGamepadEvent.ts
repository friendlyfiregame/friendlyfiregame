import type { VirtualGamepad } from "./VirtualGamepad";

export class VirtualGamepadEvent extends CustomEvent<VirtualGamepad> {
    #gamepad: VirtualGamepad;
    public constructor(type: "gamepadconnected" | "gamepaddisconnected", gamepad: VirtualGamepad) {
        super(type, { detail: gamepad });
        this.#gamepad = gamepad;
    }
    public override get detail(): VirtualGamepad {
        return this.#gamepad;
    }
    public get gamepad(): Gamepad {
        return this.#gamepad;
    }
}
