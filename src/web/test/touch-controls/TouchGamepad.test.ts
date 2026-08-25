import { describe, expect, it } from "@jest/globals";

import { initialize, TouchGamepad } from "../../../touch-controls/TouchGamepad";
import { VirtualGamepad } from "../../../touch-controls/VirtualGamepad";

initialize();

describe("TouchGamepad HTMLElement", () => {
    it("should register and create <touch-gamepad> element", () => {
        const element = document.createElement("touch-gamepad") as TouchGamepad;
        document.body.appendChild(element);

        expect(element).toBeInstanceOf(TouchGamepad);
        expect(element.shadowRoot).not.toBeNull();
        expect(element.virtualGamepad).toBeInstanceOf(VirtualGamepad);

        document.body.removeChild(element);
    });

    it("should set default enabled attribute to true upon connection", () => {
        const element = document.createElement("touch-gamepad") as TouchGamepad;
        document.body.appendChild(element);

        expect(element.enabled).toBe(true);
        expect(element.getAttribute("enabled")).toBe("true");

        document.body.removeChild(element);
    });

    it("should handle dpad attribute changes", () => {
        const element = document.createElement("touch-gamepad") as TouchGamepad;
        document.body.appendChild(element);

        expect(element.dpad).toBe("visible");

        element.dpad = "hidden";
        expect(element.getAttribute("dpad")).toBe("hidden");
        expect(element.dpad).toBe("hidden");

        element.setAttribute("dpad", "visible");
        expect(element.dpad).toBe("visible");

        document.body.removeChild(element);
    });

    it("should handle enabled attribute changes and gamepad connection events", () => {
        let connectedEventFired = false;
        let disconnectedEventFired = false;

        const connectHandler = (): void => {
            connectedEventFired = true;
        };
        const disconnectHandler = (): void => {
            disconnectedEventFired = true;
        };

        window.addEventListener("gamepadconnected", connectHandler);
        window.addEventListener("gamepaddisconnected", disconnectHandler);

        const element = document.createElement("touch-gamepad") as TouchGamepad;
        document.body.appendChild(element);

        expect(connectedEventFired).toBe(true);

        element.enabled = false;
        expect(disconnectedEventFired).toBe(true);

        window.removeEventListener("gamepadconnected", connectHandler);
        window.removeEventListener("gamepaddisconnected", disconnectHandler);
        document.body.removeChild(element);
    });

    it("should clean up gamepad when disconnected from DOM", () => {
        let disconnectedEventFired = false;
        const disconnectHandler = (): void => {
            disconnectedEventFired = true;
        };

        window.addEventListener("gamepaddisconnected", disconnectHandler);

        const element = document.createElement("touch-gamepad") as TouchGamepad;
        document.body.appendChild(element);
        document.body.removeChild(element);

        expect(disconnectedEventFired).toBe(true);

        window.removeEventListener("gamepaddisconnected", disconnectHandler);
    });

    it("should trigger button presses on touch events", () => {
        const element = document.createElement("touch-gamepad") as TouchGamepad;
        document.body.appendChild(element);

        const shadow = element.shadowRoot;
        expect(shadow).not.toBeNull();
        if (shadow === null) {
            return;
        }
        const containers = shadow.querySelectorAll("div");

        expect(containers.length).toBeGreaterThan(0);

        // Find a button container with touch listeners (e.g., A button)
        const buttonAContainer = Array.from(containers).find((div) => {
            return div.querySelector("svg") !== null && div.style.position === "absolute" && div.style.right === "50px" && div.style.bottom === "40px";
        });

        expect(buttonAContainer).toBeDefined();

        if (buttonAContainer) {
            const touch = { identifier: 1, clientX: 100, clientY: 100 } as unknown as Touch;
            const touchStartEvent = new CustomEvent("touchstart", { bubbles: true, cancelable: true });
            (touchStartEvent as unknown as Record<string, unknown>).changedTouches = [touch];

            buttonAContainer.dispatchEvent(touchStartEvent as unknown as Event);
            expect(element.virtualGamepad.buttons[0].pressed).toBe(true);

            const touchEndEvent = new CustomEvent("touchend", { bubbles: true, cancelable: true });
            (touchEndEvent as unknown as Record<string, unknown>).changedTouches = [touch];

            buttonAContainer.dispatchEvent(touchEndEvent as unknown as Event);
            expect(element.virtualGamepad.buttons[0].pressed).toBe(false);
        }

        document.body.removeChild(element);
    });

    it("should update layout scaling on display/window resize", () => {
        const element = document.createElement("touch-gamepad") as TouchGamepad;
        document.body.appendChild(element);

        expect(() => {
            window.dispatchEvent(new Event("resize"));
        }).not.toThrow();

        expect(() => {
            element.updateLayout();
        }).not.toThrow();

        document.body.removeChild(element);
    });

    it("should manage touch-active class and active control states on touch interaction", () => {
        const element = document.createElement("touch-gamepad") as TouchGamepad;
        document.body.appendChild(element);

        const shadow = element.shadowRoot;
        expect(shadow).not.toBeNull();
        if (shadow === null) {
            return;
        }

        // Find the A button container to dispatch touch events on a control element
        const containers = shadow.querySelectorAll("div");
        const buttonAContainer = Array.from(containers).find((div) => {
            return div.querySelector("svg") !== null && div.style.position === "absolute" && div.style.right === "50px" && div.style.bottom === "40px";
        });
        expect(buttonAContainer).toBeDefined();

        if (buttonAContainer) {
            const touch = { identifier: 42, clientX: 50, clientY: 50 } as unknown as Touch;
            const touchStartEvent = new CustomEvent("touchstart", { bubbles: true, cancelable: true });
            (touchStartEvent as unknown as Record<string, unknown>).changedTouches = [touch];

            buttonAContainer.dispatchEvent(touchStartEvent as unknown as Event);
            expect(element.classList.contains("touch-active")).toBe(true);

            const touchEndEvent = new CustomEvent("touchend", { bubbles: true, cancelable: true });
            (touchEndEvent as unknown as Record<string, unknown>).changedTouches = [touch];

            buttonAContainer.dispatchEvent(touchEndEvent as unknown as Event);
        }

        document.body.removeChild(element);
    });
});
