import { VirtualGamepad } from "./VirtualGamepad";
import { VirtualGamepadEvent } from "./VirtualGamepadEvent";

import svgButtonA from "../../assets/touch-controls/button-a.svg";
import svgButtonB from "../../assets/touch-controls/button-b.svg";
import svgButtonX from "../../assets/touch-controls/button-x.svg";
import svgButtonY from "../../assets/touch-controls/button-y.svg";
import svgButtonL1 from "../../assets/touch-controls/button-l1.svg";
import svgButtonL2 from "../../assets/touch-controls/button-l2.svg";
import svgButtonL3 from "../../assets/touch-controls/button-l3.svg";
import svgButtonR1 from "../../assets/touch-controls/button-r1.svg";
import svgButtonR2 from "../../assets/touch-controls/button-r2.svg";
import svgButtonR3 from "../../assets/touch-controls/button-r3.svg";
import svgButtonStart from "../../assets/touch-controls/button-start.svg";
import svgButtonSelect from "../../assets/touch-controls/button-select.svg";
import svgButtonScreenshot from "../../assets/touch-controls/button-screenshot.svg";
import svgButtonVendor from "../../assets/touch-controls/button-vendor.svg";
import svgDPad from "../../assets/touch-controls/dpad.svg";
import svgStickLeft from "../../assets/touch-controls/stick-left.svg";
import svgStickRight from "../../assets/touch-controls/stick-right.svg";

const domParser = new DOMParser();
function svgElementFromString(str: string): SVGElement {
    return domParser.parseFromString(str, "application/xml").getElementsByTagName("svg")[0];
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
    z-index: 9999;
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
        centerRows.style.position = "absolute";
        centerRows.style.width = "100%";
        centerRows.style.height = "100%";
        centerRows.style.bottom = "0";
        centerRows.style.left = "0";
        centerRows.style.display = "flex";
        centerRows.style.alignItems = "flex-start";
        centerRows.style.justifyContent = "center";
        this.addButton(8, {width: "66px", height: "66px", borderRadius: "50%"}, {svg: svgElementFromString(svgButtonSelect), width: "26px", height: "26px",
            marginLeft: "20px", marginTop: "20x"}, centerRows);
        this.addButton(16, {width: "66px", height: "66px", borderRadius: "50%"}, {svg: svgElementFromString(svgButtonVendor), width: "26px", height: "26px",
            marginLeft: "20px", marginTop: "20x"}, centerRows);
        this.addButton(16, {width: "66px", height: "66px", borderRadius: "50%"}, {svg: svgElementFromString(svgButtonScreenshot), width: "26px", height: "26px",
            marginLeft: "20px", marginTop: "20x"}, centerRows);
        this.addButton(9, {width: "66px", height: "66px", borderRadius: "50%"}, {svg: svgElementFromString(svgButtonStart), width: "26px", height: "26px",
            marginLeft: "20px", marginTop: "20x"}, centerRows);
        this.#shadow.appendChild(centerRows);
        // #endregion

        //#region lower left controls
        const lowerLeftControls = document.createElement("div");
        lowerLeftControls.className = "left bottom lower-left";
        lowerLeftControls.style.width = "300px";
        lowerLeftControls.style.height = "200px";
        lowerLeftControls.style.position = "absolute";
        lowerLeftControls.style.left = "0px";
        lowerLeftControls.style.bottom = "0px";

        const leftAnalogStick = svgElementFromString(svgStickLeft);
        leftAnalogStick.style.width = "40px";
        leftAnalogStick.style.height = "40px";
        leftAnalogStick.style.position = "absolute";
        leftAnalogStick.style.left = "63px";
        leftAnalogStick.style.top = "67px";
        leftAnalogStick.style.transform = "translate(0px, 0px)";

        lowerLeftControls.appendChild(leftAnalogStick);
        this.#shadow.appendChild(lowerLeftControls);
        //#endregion

        //#region lower right controls
        const lowerRightControls = document.createElement("div");
        lowerRightControls.className = "left bottom lower-left";
        lowerRightControls.style.width = "175px";
        lowerRightControls.style.height = "90px";
        lowerRightControls.style.position = "absolute";
        lowerRightControls.style.right = "100px";
        lowerRightControls.style.bottom = "0px";

        const rightAnalogStick = svgElementFromString(svgStickRight);
        rightAnalogStick.style.width = "40px";
        rightAnalogStick.style.height = "40px";
        rightAnalogStick.style.position = "absolute";
        rightAnalogStick.style.left = "45px";
        rightAnalogStick.style.top = "20px";
        rightAnalogStick.style.transform = "translate(0px, 0px)";

        lowerRightControls.appendChild(rightAnalogStick);
        this.#shadow.appendChild(lowerRightControls);
        //#endregion

        this.addButton(0, {width: "66px", height: "66px", borderRadius: "50%", position: "absolute", right: "50px", bottom: "40px"},
            {svg: svgElementFromString(svgButtonA), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px"});
        this.addButton(1, {width: "66px", height: "66px", borderRadius: "50%", position: "absolute", right: "10px", bottom: "80px"},
            {svg: svgElementFromString(svgButtonB), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px"});
        this.addButton(2, {width: "66px", height: "66px", borderRadius: "50%", position: "absolute", right: "90px", bottom: "80px"},
            {svg: svgElementFromString(svgButtonX), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px"});
        this.addButton(3, {width: "66px", height: "66px", borderRadius: "50%", position: "absolute", right: "50px", bottom: "120px"},
            {svg: svgElementFromString(svgButtonY), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px"});

        this.addButton(4, {width: "100px", height: "100px", position: "absolute", left: "110px", bottom: "208px"},
            {svg: svgElementFromString(svgButtonL1), width: "26px", height: "26px", position: "absolute", left: "44px", top: "72px"});
        this.addButton(6, {width: "110px", height: "100px", position: "absolute", left: "0px", bottom: "185px"},
            {svg: svgElementFromString(svgButtonL2), width: "26px", height: "26px", position: "absolute", left: "74px", top: "30px"});
        this.addButton(10, {width: "66px", height: "66px", position: "absolute", left: "270px", bottom: "15px"},
            {svg: svgElementFromString(svgButtonL3), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px"});

        this.addButton(5, {width: "66px", height: "66px", borderRadius: "50%", position: "absolute", right: "140px", bottom: "190px"},
            {svg: svgElementFromString(svgButtonR1), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px"});
        this.addButton(7, {width: "96px", height: "96px", borderRadius: "50%", position: "absolute", right: "40px", bottom: "194px"},
            {svg: svgElementFromString(svgButtonR2), width: "26px", height: "26px", marginLeft: "35px", marginTop: "35px"});
        this.addButton(11, {width: "66px", height: "66px", borderRadius: "50%", position: "absolute", right: "270px", bottom: "15px"},
            {svg: svgElementFromString(svgButtonR3), width: "26px", height: "26px", marginLeft: "20px", marginTop: "20px"});

        // DPad - TODO make more than one touchable surface / button
        this.addButton(8, {width: "98px", height: "98px", position: "absolute", left: "150px", bottom: "0px"},
            {svg: svgElementFromString(svgDPad), width: "74px", height: "74px", marginLeft: "12px", marginTop: "12px"});

    }

    public connectedCallback(): void {
		if (!this.hasAttribute("enabled")) {
            this.setAttribute("enabled", "true");
        }
	}

    // Element has been removed.
	public disconnectedCallback(): void {
        // TODO Disconnect gamepad.
	}

    // Element has been moved into another document.
	public adoptedCallback(): void {

	}

    // Element attribute has been changed.
    // Attention: attributeChangedCallback will be called BEFORE connectedCallback
	public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        const attribute = TouchGamepad.#ATTRIBUTES.get(name);
        if (attribute !== undefined && newValue !== null) {
            if (!attribute.values.includes(newValue)) {
                this.setAttribute(name, attribute.values.includes(oldValue) ? oldValue: attribute.default);
                return;
            }
        }

        switch (name) {
            case "enabled":
                if (this.enabled) {
                    navigator.getGamepads = () => navigatorGetGamepadsOrig().concat(this.#virtualGamepad);
                    window.dispatchEvent(new VirtualGamepadEvent("gamepadconnected", this.#virtualGamepad));
                    this.style.visibility = "visible";
                } else {
                    navigator.getGamepads = navigatorGetGamepadsOrig;
                    window.dispatchEvent(new VirtualGamepadEvent("gamepaddisconnected", this.#virtualGamepad));
                    this.style.visibility = "hidden";
                }
                break;
            default:
                break;
        }

	}

    public get enabled(): boolean {
        return this.getAttribute("enabled") !== "false";
    }

    public set enabled(enabled: boolean) {
        this.setAttribute("enabled", enabled ? "true": "false");
    }

    public get dpad(): DPadAttributeValue {
        return (this.getAttribute("dpad") as DPadAttributeValue) || "visible";
    }

    public set dpad(dpad: DPadAttributeValue) {
        this.setAttribute("dpad", dpad);
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
        container.style.width = element.width;
        container.style.height = element.height;
        container.style.borderRadius = element.borderRadius || "";
        container.style.position = element.position || "";
        container.style.top = element.top || "";
        container.style.right = element.right || "";
        container.style.bottom = element.bottom || "";
        container.style.left = element.left || "";

        const img = button.svg;
        img.style.width = button.width;
        img.style.height = button.height;
        img.style.marginLeft = button.marginLeft || "";
        img.style.marginTop = button.marginTop || "";
        img.style.position = button.position || "";
        img.style.top = button.top || "";
        img.style.right = button.right || "";
        img.style.bottom = button.bottom || "";
        img.style.left = button.left || "";
        container.appendChild(img);

        container.addEventListener("touchstart", (event) => {
            event.preventDefault();
            this.#virtualGamepad.pressButton(buttonIndex);
        });
        container.addEventListener("touchcancel", (event) => {
            event.preventDefault();
            this.#virtualGamepad.releaseButton(buttonIndex);
        });
        container.addEventListener("touchend", (event) => {
            event.preventDefault();
            this.#virtualGamepad.releaseButton(buttonIndex);
        });
        parent.appendChild(container);
    }

}

export function initialize(): void {
    customElements.define("touch-gamepad", TouchGamepad);
}
