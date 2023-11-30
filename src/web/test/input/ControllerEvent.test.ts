import { describe, it, expect } from "@jest/globals";

import { ControllerEvent } from "../../input/ControllerEvent";
import { ControllerFamily } from "../../input/ControllerFamily";
import { ControllerEventType } from "../../input/ControllerEventType";
import { ControllerIntent } from "../../input/ControllerIntent";

describe("ControllerEvent", () => {
    describe("constructor", () => {
        it("initializes event correctly", () => {
            const event = new ControllerEvent(ControllerFamily.GAMEPAD, ControllerEventType.DOWN, [ControllerIntent.ABORT, ControllerIntent.PAUSE], false);
            expect(event.controllerFamily).toBe(ControllerFamily.GAMEPAD);
            expect(event.eventType).toBe(ControllerEventType.DOWN);
            expect(event.repeat).toBe(false);
            expect(event.isAbort).toBe(true);
            expect(event.isConfirm).toBe(false);
            expect(event.isMenuDown).toBe(false);
            expect(event.isMenuLeft).toBe(false);
            expect(event.isMenuUp).toBe(false);
            expect(event.isPause).toBe(true);
            expect(event.isPlayerAction).toBe(false);
        });
    });
});
