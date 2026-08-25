import svgButtonA from "../../assets/touch-controls/button-a.svg";
import svgButtonB from "../../assets/touch-controls/button-b.svg";
import svgButtonL1 from "../../assets/touch-controls/button-l1.svg";
import svgButtonL2 from "../../assets/touch-controls/button-l2.svg";
import svgButtonL3 from "../../assets/touch-controls/button-l3.svg";
import svgButtonR1 from "../../assets/touch-controls/button-r1.svg";
import svgButtonR2 from "../../assets/touch-controls/button-r2.svg";
import svgButtonR3 from "../../assets/touch-controls/button-r3.svg";
import svgButtonScreenshot from "../../assets/touch-controls/button-screenshot.svg";
import svgButtonSelect from "../../assets/touch-controls/button-select.svg";
import svgButtonStart from "../../assets/touch-controls/button-start.svg";
import svgButtonVendor from "../../assets/touch-controls/button-vendor.svg";
import svgButtonX from "../../assets/touch-controls/button-x.svg";
import svgButtonY from "../../assets/touch-controls/button-y.svg";
import svgDPad from "../../assets/touch-controls/dpad.svg";
import svgStickLeft from "../../assets/touch-controls/stick-left.svg";
import svgStickRight from "../../assets/touch-controls/stick-right.svg";
import { VirtualGamepad } from "./VirtualGamepad";
import { VirtualGamepadEvent } from "./VirtualGamepadEvent";

const domParser = new DOMParser();
function svgElementFromString(str: string | { default?: string }): SVGElement {
    const raw = typeof str === "string" ? str : str?.default ?? "<svg></svg>";
    const parsed = domParser.parseFromString(raw, "application/xml").getElementsByTagName("svg")[0];
    if (parsed === undefined || parsed === null) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        return svg;
    }
    return parsed;
}

const navigatorGetGamepadsOrig = navigator.getGamepads.bind(navigator);

function createStyle(): HTMLStyleElement {
    const element = document.createElement("style");
    element.innerHTML = `:host {
    position: absolute;
    display: block;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 9998;
    pointer-events: none;
}

.control-container {
    opacity: 0;
    transition: opacity 0.5s ease, transform 0.15s ease, filter 0.15s ease;
    pointer-events: auto;
}

:host(.touch-active) .control-container {
    opacity: 0.3;
}

.control-container.active,
:host(.touch-active) .control-container.active {
    opacity: 0.9 !important;
}

.control-container.active-button {
    transform: scale(0.92);
}

.dpad-svg, .stick-svg {
    transition: transform 0.15s ease, filter 0.15s ease;
}`;
    return element;
}

interface Attribute<T> {
    readonly values: T[];
    readonly default: T;
}

class StringAttribute<T extends string> implements Attribute<T> {

    readonly #values: T[];
    readonly #default: T;

    public constructor(values: T[], defaultValue: T) {
        this.#values = values;
        this.#default = defaultValue;
    }

    public get values(): T[] {
        return this.#values;
    }

    public get default(): T {
        return this.#default;
    }

}

type DPadAttributeValue = "visible" | "hidden";

export class TouchGamepad extends HTMLElement {

    static readonly #ATTRIBUTES: Map<string, Attribute<string>> = new Map();
    static {
        TouchGamepad.#ATTRIBUTES.set("enabled", new StringAttribute(["true", "false"], "true"));
        TouchGamepad.#ATTRIBUTES.set("dpad", new StringAttribute(["visible", "hidden"], "visible"));
    }

    readonly #shadow: ShadowRoot;

    readonly #virtualGamepad: VirtualGamepad;

    readonly #dpadContainer: HTMLElement;

    #isGamepadRegistered = false;

    #resizeObserver: ResizeObserver | null = null;
    readonly #onWindowResize = (): void => {
        this.updateLayout();
    };

    readonly #activeDisplayTouches = new Set<number>();
    #inactivityTimer: number | null = null;


    public static get observedAttributes(): string[] {
        return Array.from(TouchGamepad.#ATTRIBUTES.keys());
    }

    public constructor() {
        super();

        this.#virtualGamepad = new VirtualGamepad({ index: navigatorGetGamepadsOrig().length });

        this.#shadow = this.attachShadow({ mode: "open" });
        this.#shadow.appendChild(createStyle());

        // #region Start, select, vendor and screenshot.
        const centerRows = document.createElement("div");
        centerRows.className = "control-container";
        centerRows.style.position = "absolute";
        centerRows.style.width = "100%";
        centerRows.style.height = "100%";
        centerRows.style.bottom = "0";
        centerRows.style.left = "0";
        centerRows.style.display = "flex";
        centerRows.style.alignItems = "flex-start";
        centerRows.style.justifyContent = "center";
        centerRows.style.pointerEvents = "none";

        this.addButton(8, { width: "66px", height: "66px", borderRadius: "50%" }, {
            svg: svgElementFromString(svgButtonSelect), width: "26px", height: "26px",
            marginLeft: "20px", marginTop: "20px"
        }, centerRows);
        this.addButton(16, { width: "66px", height: "66px", borderRadius: "50%" }, {
            svg: svgElementFromString(svgButtonVendor), width: "26px", height: "26px",
            marginLeft: "20px", marginTop: "20px"
        }, centerRows);
        this.addButton(17, { width: "66px", height: "66px", borderRadius: "50%" }, {
            svg: svgElementFromString(svgButtonScreenshot), width: "26px", height: "26px",
            marginLeft: "20px", marginTop: "20px"
        }, centerRows);
        this.addButton(9, { width: "66px", height: "66px", borderRadius: "50%" }, {
            svg: svgElementFromString(svgButtonStart), width: "26px", height: "26px",
            marginLeft: "20px", marginTop: "20px"
        }, centerRows);
        this.#shadow.appendChild(centerRows);
        // #endregion

        //#region lower left controls
        const lowerLeftControls = document.createElement("div");
        lowerLeftControls.className = "control-container left bottom lower-left";
        lowerLeftControls.style.width = "300px";
        lowerLeftControls.style.height = "200px";
        lowerLeftControls.style.position = "absolute";
        lowerLeftControls.style.left = "0px";
        lowerLeftControls.style.bottom = "0px";
        lowerLeftControls.style.pointerEvents = "auto";

        const leftAnalogStick = svgElementFromString(svgStickLeft);
        leftAnalogStick.classList.add("stick-svg");
        leftAnalogStick.style.width = "40px";
        leftAnalogStick.style.height = "40px";
        leftAnalogStick.style.position = "absolute";
        leftAnalogStick.style.left = "63px";
        leftAnalogStick.style.top = "67px";
        leftAnalogStick.style.transform = "translate(0px, 0px)";

        lowerLeftControls.appendChild(leftAnalogStick);
        this.#shadow.appendChild(lowerLeftControls);
        this.addAnalogStick(lowerLeftControls, leftAnalogStick, { x: 63 + 20, y: 67 + 20 }, 40, 0, 1, { width: 300, height: 200 });
        //#endregion

        //#region lower right controls
        const lowerRightControls = document.createElement("div");
        lowerRightControls.className = "control-container right bottom lower-right";
        lowerRightControls.style.width = "175px";
        lowerRightControls.style.height = "90px";
        lowerRightControls.style.position = "absolute";
        lowerRightControls.style.right = "100px";
        lowerRightControls.style.bottom = "0px";
        lowerRightControls.style.pointerEvents = "auto";

        const rightAnalogStick = svgElementFromString(svgStickRight);
        rightAnalogStick.classList.add("stick-svg");
        rightAnalogStick.style.width = "40px";
        rightAnalogStick.style.height = "40px";
        rightAnalogStick.style.position = "absolute";
        rightAnalogStick.style.left = "45px";
        rightAnalogStick.style.top = "20px";
        rightAnalogStick.style.transform = "translate(0px, 0px)";

        lowerRightControls.appendChild(rightAnalogStick);
        this.#shadow.appendChild(lowerRightControls);
        this.addAnalogStick(lowerRightControls, rightAnalogStick, { x: 45 + 20, y: 20 + 20 }, 40, 2, 3, { width: 175, height: 90 });
        //#endregion

        this.addButton(0, { width: "66px", height: "66px", borderRadius: "50%", position: "absolute", right: "50px", bottom: "40px" },
            { svg: svgElementFromString(svgButtonA), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px" });
        this.addButton(1, { width: "66px", height: "66px", borderRadius: "50%", position: "absolute", right: "10px", bottom: "80px" },
            { svg: svgElementFromString(svgButtonB), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px" });
        this.addButton(2, { width: "66px", height: "66px", borderRadius: "50%", position: "absolute", right: "90px", bottom: "80px" },
            { svg: svgElementFromString(svgButtonX), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px" });
        this.addButton(3, { width: "66px", height: "66px", borderRadius: "50%", position: "absolute", right: "50px", bottom: "120px" },
            { svg: svgElementFromString(svgButtonY), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px" });

        this.addButton(4, { width: "100px", height: "100px", position: "absolute", left: "110px", bottom: "208px" },
            { svg: svgElementFromString(svgButtonL1), width: "26px", height: "26px", position: "absolute", left: "44px", top: "72px" });
        this.addButton(6, { width: "110px", height: "100px", position: "absolute", left: "0px", bottom: "185px" },
            { svg: svgElementFromString(svgButtonL2), width: "26px", height: "26px", position: "absolute", left: "74px", top: "30px" });
        this.addButton(10, { width: "66px", height: "66px", position: "absolute", left: "270px", bottom: "15px" },
            { svg: svgElementFromString(svgButtonL3), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px" });

        this.addButton(5, { width: "66px", height: "66px", borderRadius: "50%", position: "absolute", right: "140px", bottom: "190px" },
            { svg: svgElementFromString(svgButtonR1), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px" });
        this.addButton(7, { width: "96px", height: "96px", borderRadius: "50%", position: "absolute", right: "40px", bottom: "194px" },
            { svg: svgElementFromString(svgButtonR2), width: "26px", height: "26px", marginLeft: "35px", marginTop: "35px" });
        this.addButton(11, { width: "66px", height: "66px", borderRadius: "50%", position: "absolute", right: "270px", bottom: "15px" },
            { svg: svgElementFromString(svgButtonR3), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px" });

        // DPad
        this.#dpadContainer = document.createElement("div");
        this.#dpadContainer.className = "control-container";
        this.#dpadContainer.style.width = "98px";
        this.#dpadContainer.style.height = "98px";
        this.#dpadContainer.style.position = "absolute";
        this.#dpadContainer.style.left = "150px";
        this.#dpadContainer.style.bottom = "0px";
        this.#dpadContainer.style.pointerEvents = "auto";

        const dpadSvg = svgElementFromString(svgDPad);
        dpadSvg.classList.add("dpad-svg");
        dpadSvg.style.width = "74px";
        dpadSvg.style.height = "74px";
        dpadSvg.style.marginLeft = "12px";
        dpadSvg.style.marginTop = "12px";

        this.#dpadContainer.appendChild(dpadSvg);
        this.#shadow.appendChild(this.#dpadContainer);
        this.addDPad(this.#dpadContainer, dpadSvg, 49, 49, 49, { width: 98, height: 98 });

    }

    #registerDisplayTouch(touchId: number): void {
        this.#activeDisplayTouches.add(touchId);
        if (this.#inactivityTimer !== null) {
            window.clearTimeout(this.#inactivityTimer);
            this.#inactivityTimer = null;
        }
        this.classList.add("touch-active");
    }

    #unregisterDisplayTouch(touchId: number): void {
        this.#activeDisplayTouches.delete(touchId);
        if (this.#activeDisplayTouches.size === 0) {
            if (this.#inactivityTimer !== null) {
                window.clearTimeout(this.#inactivityTimer);
            }
            this.#inactivityTimer = window.setTimeout(() => {
                this.classList.remove("touch-active");
                this.#inactivityTimer = null;
            }, 5000);
        }
    }

    public connectedCallback(): void {
        if (!this.hasAttribute("enabled")) {
            this.setAttribute("enabled", "true");
        }
        if (this.#dpadContainer !== undefined) {
            this.#dpadContainer.style.display = this.dpad === "hidden" ? "none" : "block";
        }


        window.addEventListener("resize", this.#onWindowResize);
        if (typeof ResizeObserver !== "undefined") {
            this.#resizeObserver = new ResizeObserver(() => {
                this.updateLayout();
            });
            this.#resizeObserver.observe(this);
        }
        this.updateLayout();
    }

    // Element has been removed.
    public disconnectedCallback(): void {

        window.removeEventListener("resize", this.#onWindowResize);

        if (this.#inactivityTimer !== null) {
            window.clearTimeout(this.#inactivityTimer);
            this.#inactivityTimer = null;
        }
        this.#activeDisplayTouches.clear();
        this.classList.remove("touch-active");

        if (this.#resizeObserver !== null) {
            this.#resizeObserver.disconnect();
            this.#resizeObserver = null;
        }

        if (this.#isGamepadRegistered) {
            this.#isGamepadRegistered = false;
            navigator.getGamepads = navigatorGetGamepadsOrig;
            this.#virtualGamepad.reset();
            window.dispatchEvent(new VirtualGamepadEvent("gamepaddisconnected", this.#virtualGamepad));
        }
    }

    // Element has been moved into another document.
    public adoptedCallback(): void {

    }

    // Element attribute has been changed.
    // Attention: attributeChangedCallback will be called BEFORE connectedCallback
    public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
        if (oldValue === newValue) {
            return;
        }

        const attribute = TouchGamepad.#ATTRIBUTES.get(name);
        if (attribute !== undefined && newValue !== null) {
            if (!attribute.values.includes(newValue)) {
                const fallback = (oldValue !== null && attribute.values.includes(oldValue)) ? oldValue : attribute.default;
                this.setAttribute(name, fallback);
                return;
            }
        }

        switch (name) {
            case "enabled": {
                const isEnabled = this.enabled;
                if (isEnabled && !this.#isGamepadRegistered) {
                    this.#isGamepadRegistered = true;
                    navigator.getGamepads = () => navigatorGetGamepadsOrig().concat(this.#virtualGamepad);
                    window.dispatchEvent(new VirtualGamepadEvent("gamepadconnected", this.#virtualGamepad));
                    this.style.visibility = "visible";
                } else if (!isEnabled && this.#isGamepadRegistered) {
                    this.#isGamepadRegistered = false;
                    navigator.getGamepads = navigatorGetGamepadsOrig;
                    this.#virtualGamepad.reset();
                    window.dispatchEvent(new VirtualGamepadEvent("gamepaddisconnected", this.#virtualGamepad));
                    this.style.visibility = "hidden";
                }
                break;
            }
            case "dpad": {
                if (this.#dpadContainer !== undefined) {
                    this.#dpadContainer.style.display = this.dpad === "hidden" ? "none" : "block";
                }
                break;
            }
            default:
                break;
        }

    }

    public updateLayout(): void {
        const bounds = this.getBoundingClientRect();
        const width = bounds.width > 0 ? bounds.width : window.innerWidth;
        const height = bounds.height > 0 ? bounds.height : window.innerHeight;

        let scale = 1;
        if (width > 0 && height > 0) {
            const minDim = Math.min(width, height);
            if (minDim < 450) {
                scale = Math.max(0.6, minDim / 450);
            }
        }
        this.style.setProperty("--touch-gamepad-scale", scale.toString());
    }

    public get enabled(): boolean {
        return this.getAttribute("enabled") !== "false";
    }

    public set enabled(enabled: boolean) {
        this.setAttribute("enabled", enabled ? "true" : "false");
    }

    public get dpad(): DPadAttributeValue {
        const val = this.getAttribute("dpad");
        return val === "hidden" ? "hidden" : "visible";
    }

    public set dpad(dpad: DPadAttributeValue) {
        this.setAttribute("dpad", dpad);
    }

    public get virtualGamepad(): VirtualGamepad {
        return this.#virtualGamepad;
    }

    public addButton(buttonIndex: number,
        element: {
            width: string
            height: string
            borderRadius?: string
            position?: string
            top?: string
            right?: string
            bottom?: string
            left?: string
        },
        button: {
            svg: SVGElement
            width: string
            height: string
            marginLeft?: string
            marginTop?: string
            position?: string
            top?: string
            right?: string
            bottom?: string
            left?: string
        },
        parent: ShadowRoot | HTMLElement = this.#shadow
    ): void {
        const container = document.createElement("div");
        container.className = "control-container";
        container.style.width = element.width;
        container.style.height = element.height;
        container.style.borderRadius = element.borderRadius ?? "";
        container.style.position = element.position ?? "";
        container.style.top = element.top ?? "";
        container.style.right = element.right ?? "";
        container.style.bottom = element.bottom ?? "";
        container.style.left = element.left ?? "";
        container.style.pointerEvents = "auto";

        const img = button.svg;
        img.style.width = button.width;
        img.style.height = button.height;
        img.style.marginLeft = button.marginLeft ?? "";
        img.style.marginTop = button.marginTop ?? "";
        img.style.position = button.position ?? "";
        img.style.top = button.top ?? "";
        img.style.right = button.right ?? "";
        img.style.bottom = button.bottom ?? "";
        img.style.left = button.left ?? "";
        container.appendChild(img);

        const activeTouches = new Set<number>();

        const handleTouchStart = (event: TouchEvent): void => {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
                activeTouches.add(event.changedTouches[i].identifier);
                this.#registerDisplayTouch(event.changedTouches[i].identifier);
            }
            if (activeTouches.size > 0) {
                container.classList.add("active", "active-button");
                this.#virtualGamepad.pressButton(buttonIndex);
            }
        };

        const handleTouchEnd = (event: TouchEvent): void => {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
                activeTouches.delete(event.changedTouches[i].identifier);
                this.#unregisterDisplayTouch(event.changedTouches[i].identifier);
            }
            if (activeTouches.size === 0) {
                container.classList.remove("active", "active-button");
                this.#virtualGamepad.releaseButton(buttonIndex);
            }
        };

        container.addEventListener("touchstart", handleTouchStart);
        container.addEventListener("touchcancel", handleTouchEnd);
        container.addEventListener("touchend", handleTouchEnd);
        parent.appendChild(container);
    }

    private addAnalogStick(
        container: HTMLElement, stickElement: SVGElement,
        stickCenter: { x: number, y: number }, maxRadius: number,
        axisX: number, axisY: number,
        containerInitialSize: { width: number, height: number }
    ): void {
        let touchId: number | null = null;

        const updateStick = (touch: Touch | null): void => {
            if (!touch) {
                container.classList.remove("active");
                stickElement.style.transform = "translate(0px, 0px) scale(1)";
                stickElement.style.filter = "none";
                this.#virtualGamepad.setAxis(axisX, 0);
                this.#virtualGamepad.setAxis(axisY, 0);
                return;
            }
            container.classList.add("active");
            const bounds = container.getBoundingClientRect();
            const scaleX = bounds.width > 0 ? bounds.width / containerInitialSize.width : 1;
            const scaleY = bounds.height > 0 ? bounds.height / containerInitialSize.height : 1;

            const scaledCenterX = stickCenter.x * scaleX;
            const scaledCenterY = stickCenter.y * scaleY;
            const scaledMaxRadius = maxRadius * scaleX;

            const touchX = touch.clientX - bounds.left;
            const touchY = touch.clientY - bounds.top;

            let dx = touchX - scaledCenterX;
            let dy = touchY - scaledCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > scaledMaxRadius && distance > 0) {
                dx = (dx / distance) * scaledMaxRadius;
                dy = (dy / distance) * scaledMaxRadius;
            }

            const unscaledDx = scaleX > 0 ? dx / scaleX : dx;
            const unscaledDy = scaleY > 0 ? dy / scaleY : dy;

            stickElement.style.transform = `translate(${unscaledDx}px, ${unscaledDy}px) scale(1.08)`;
            stickElement.style.filter = "drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))";
            this.#virtualGamepad.setAxis(axisX, scaledMaxRadius > 0 ? dx / scaledMaxRadius : 0);
            this.#virtualGamepad.setAxis(axisY, scaledMaxRadius > 0 ? dy / scaledMaxRadius : 0);
        };

        container.addEventListener("touchstart", (event) => {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
                if (touchId === null) {
                    touchId = event.changedTouches[i].identifier;
                    this.#registerDisplayTouch(touchId);
                    updateStick(event.changedTouches[i]);
                    break;
                }
            }
        });

        container.addEventListener("touchmove", (event) => {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
                if (event.changedTouches[i].identifier === touchId) {
                    updateStick(event.changedTouches[i]);
                    break;
                }
            }
        });

        const handleTouchEnd = (event: TouchEvent): void => {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
                if (event.changedTouches[i].identifier === touchId) {
                    this.#unregisterDisplayTouch(touchId);
                    touchId = null;
                    updateStick(null);
                    break;
                }
            }
        };

        container.addEventListener("touchend", handleTouchEnd);
        container.addEventListener("touchcancel", handleTouchEnd);
    }

    private addDPad(
        container: HTMLElement, dpadSvg: SVGElement,
        centerX: number, centerY: number, radius: number,
        containerInitialSize: { width: number, height: number }
    ): void {
        let touchId: number | null = null;
        let pressedButtons = new Set<number>();

        const updateDPad = (touch: Touch | null): void => {
            if (!touch) {
                container.classList.remove("active");
                dpadSvg.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)";
                dpadSvg.style.filter = "none";
                pressedButtons.forEach(btn => this.#virtualGamepad.releaseButton(btn));
                pressedButtons.clear();
                return;
            }
            const bounds = container.getBoundingClientRect();
            const scaleX = bounds.width > 0 ? bounds.width / containerInitialSize.width : 1;
            const scaleY = bounds.height > 0 ? bounds.height / containerInitialSize.height : 1;

            const scaledCenterX = centerX * scaleX;
            const scaledCenterY = centerY * scaleY;
            const scaledRadius = radius * scaleX;

            const touchX = touch.clientX - bounds.left;
            const touchY = touch.clientY - bounds.top;

            const dx = touchX - scaledCenterX;
            const dy = touchY - scaledCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const newPressed = new Set<number>();
            let shiftX = 0;
            let shiftY = 0;
            let rotation = 0;

            if (distance > scaledRadius * 0.2) {
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                if (angle >= -67.5 && angle <= 67.5) {
                    newPressed.add(15); // Right
                    shiftX += 8;
                    rotation += 3;
                }
                if (angle >= 112.5 || angle <= -112.5) {
                    newPressed.add(14); // Left
                    shiftX -= 8;
                    rotation -= 3;
                }
                if (angle >= 22.5 && angle <= 157.5) {
                    newPressed.add(13); // Down
                    shiftY += 8;
                    rotation += 1.5;
                }
                if (angle >= -157.5 && angle <= -22.5) {
                    newPressed.add(12); // Up
                    shiftY -= 8;
                    rotation -= 1.5;
                }
            }

            if (newPressed.size > 0) {
                container.classList.add("active");
                dpadSvg.style.transform = `translate(${shiftX}px, ${shiftY}px) rotate(${rotation}deg) scale(0.96)`;
                dpadSvg.style.filter = "drop-shadow(0 0 6px rgba(255, 255, 255, 0.75))";
            } else {
                container.classList.remove("active");
                dpadSvg.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)";
                dpadSvg.style.filter = "none";
            }

            pressedButtons.forEach(btn => {
                if (!newPressed.has(btn)) {
                    this.#virtualGamepad.releaseButton(btn);
                }
            });
            newPressed.forEach(btn => {
                if (!pressedButtons.has(btn)) {
                    this.#virtualGamepad.pressButton(btn);
                }
            });
            pressedButtons = newPressed;
        };

        container.addEventListener("touchstart", (event) => {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
                if (touchId === null) {
                    touchId = event.changedTouches[i].identifier;
                    this.#registerDisplayTouch(touchId);
                    updateDPad(event.changedTouches[i]);
                    break;
                }
            }
        });

        container.addEventListener("touchmove", (event) => {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
                if (event.changedTouches[i].identifier === touchId) {
                    updateDPad(event.changedTouches[i]);
                    break;
                }
            }
        });

        const handleTouchEnd = (event: TouchEvent): void => {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
                if (event.changedTouches[i].identifier === touchId) {
                    this.#unregisterDisplayTouch(touchId);
                    touchId = null;
                    updateDPad(null);
                    break;
                }
            }
        };

        container.addEventListener("touchend", handleTouchEnd);
        container.addEventListener("touchcancel", handleTouchEnd);
    }

}

export function initialize(): void {
    if (!customElements.get("touch-gamepad")) {
        customElements.define("touch-gamepad", TouchGamepad);
    }
}



