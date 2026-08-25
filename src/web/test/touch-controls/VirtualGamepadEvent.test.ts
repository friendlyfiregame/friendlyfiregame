import { describe, expect, it } from "@jest/globals";

import { VirtualGamepad } from "../../../touch-controls/VirtualGamepad";
import { VirtualGamepadEvent } from "../../../touch-controls/VirtualGamepadEvent";

describe("VirtualGamepadEvent", () => {
    it("should instantiate gamepadconnected event with VirtualGamepad payload", () => {
        const gamepad = new VirtualGamepad({ index: 0 });
        const event = new VirtualGamepadEvent("gamepadconnected", gamepad);

        expect(event.type).toBe("gamepadconnected");
        expect(event.gamepad).toBe(gamepad);
        expect(event.detail).toBe(gamepad);
        expect(event.bubbles).toBe(true);
        expect(event.cancelable).toBe(true);
    });

    it("should instantiate gamepaddisconnected event with VirtualGamepad payload", () => {
        const gamepad = new VirtualGamepad({ index: 2 });
        const event = new VirtualGamepadEvent("gamepaddisconnected", gamepad);

        expect(event.type).toBe("gamepaddisconnected");
        expect(event.gamepad).toBe(gamepad);
        expect(event.detail).toBe(gamepad);
    });
});
