import type { VirtualGamepad } from "./VirtualGamepad";

export class VirtualGamepadEvent extends CustomEvent<VirtualGamepad> {
    #gamepad: Gamepad;
    public constructor(type: "gamepadconnected" | "gamepaddisconnected", gamepad: VirtualGamepad) {
        super(type, { detail: gamepad });
        this.#gamepad = gamepad;
    }
    public override get detail(): any {
        return {};
    }
    public get gamepad(): Gamepad {
        return this.#gamepad;
    }
}
