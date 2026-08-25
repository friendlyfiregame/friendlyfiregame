import { describe, expect, it } from "@jest/globals";

import { VirtualGamepad } from "../../../touch-controls/VirtualGamepad";

describe("VirtualGamepad", () => {
    it("should initialize with default standard gamepad properties", () => {
        const gamepad = new VirtualGamepad({ index: 0 });

        expect(gamepad.index).toBe(0);
        expect(gamepad.id).toBe("Cat Hive Virtual Touch Controller");
        expect(gamepad.connected).toBe(true);
        expect(gamepad.mapping).toBe("standard");
        expect(gamepad.axes).toHaveLength(4);
        expect(gamepad.buttons).toHaveLength(18);
        expect(gamepad.hapticActuators).toEqual([]);
        expect(gamepad.vibrationActuator).toBeNull();
        expect(gamepad.timestamp).toBeGreaterThan(0);

        gamepad.axes.forEach((axis) => {
            expect(axis).toBe(0.0);
        });

        gamepad.buttons.forEach((button) => {
            expect(button.pressed).toBe(false);
            expect(button.touched).toBe(false);
            expect(button.value).toBe(0.0);
        });
    });

    it("should press a button and update state", () => {
        const gamepad = new VirtualGamepad({ index: 1 });
        const initialTimestamp = gamepad.timestamp;

        gamepad.pressButton(0);

        expect(gamepad.buttons[0].pressed).toBe(true);
        expect(gamepad.buttons[0].touched).toBe(true);
        expect(gamepad.buttons[0].value).toBe(1.0);
        expect(gamepad.timestamp).toBeGreaterThanOrEqual(initialTimestamp);
    });

    it("should release a button and update state", () => {
        const gamepad = new VirtualGamepad({ index: 0 });
        gamepad.pressButton(3);
        gamepad.releaseButton(3);

        expect(gamepad.buttons[3].pressed).toBe(false);
        expect(gamepad.buttons[3].touched).toBe(false);
        expect(gamepad.buttons[3].value).toBe(0.0);
    });

    it("should safely handle out-of-bounds button indices", () => {
        const gamepad = new VirtualGamepad({ index: 0 });
        expect(() => gamepad.pressButton(-1)).not.toThrow();
        expect(() => gamepad.pressButton(99)).not.toThrow();
        expect(() => gamepad.releaseButton(-1)).not.toThrow();
        expect(() => gamepad.releaseButton(99)).not.toThrow();
    });

    it("should set axis values", () => {
        const gamepad = new VirtualGamepad({ index: 0 });

        gamepad.setAxis(0, -0.75);
        gamepad.setAxis(1, 0.5);

        expect(gamepad.axes[0]).toBe(-0.75);
        expect(gamepad.axes[1]).toBe(0.5);
        expect(gamepad.axes[2]).toBe(0.0);
    });

    it("should safely handle out-of-bounds axis indices", () => {
        const gamepad = new VirtualGamepad({ index: 0 });
        expect(() => gamepad.setAxis(-1, 0.5)).not.toThrow();
        expect(() => gamepad.setAxis(10, 0.5)).not.toThrow();
    });

    it("should reset all buttons and axes on reset()", () => {
        const gamepad = new VirtualGamepad({ index: 0 });
        gamepad.pressButton(0);
        gamepad.pressButton(15);
        gamepad.setAxis(0, 0.9);
        gamepad.setAxis(1, -0.9);

        gamepad.reset();

        expect(gamepad.axes[0]).toBe(0.0);
        expect(gamepad.axes[1]).toBe(0.0);

        gamepad.buttons.forEach((btn) => {
            expect(btn.pressed).toBe(false);
            expect(btn.touched).toBe(false);
            expect(btn.value).toBe(0.0);
        });
    });
});
