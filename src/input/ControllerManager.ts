import { VirtualKeyboardEvent } from "./GamepadInput";
import { ControllerEvent } from "./ControllerEvent";
import { ControllerFamily } from "./ControllerFamily";
import { Signal } from "../Signal";

/** Symbol to identify the current/active controller family */
const currentControllerFamilySymbol = Symbol("currentControllerFamily");

export class ControllerManager {

    private static readonly INSTANCE = new ControllerManager();
    public static getInstance(): ControllerManager {
        return ControllerManager.INSTANCE;
    }

    public readonly onButtonDown = new Signal<ControllerEvent>();
    public readonly onButtonUp = new Signal<ControllerEvent>();
    public readonly onButtonPress = new Signal<ControllerEvent>();

    private [currentControllerFamilySymbol]: ControllerFamily;
    private constructor(initialControllerFamily: ControllerFamily = ControllerFamily.KEYBOARD) {
        this.currentControllerFamily = initialControllerFamily;
        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e instanceof VirtualKeyboardEvent) {
                if (this.currentControllerFamily !== ControllerFamily.GAMEPAD) {
                    this.currentControllerFamily = ControllerFamily.GAMEPAD;
                }
            } else if (this.currentControllerFamily !== ControllerFamily.KEYBOARD) {
                this.currentControllerFamily = ControllerFamily.KEYBOARD;
            }
        });
    }

    public set currentControllerFamily(controllerFamily: ControllerFamily) {
        this[currentControllerFamilySymbol] = controllerFamily;
        console.info(`New active controller family: ${this.currentControllerFamily}`);
    }

    /**
     * Returns the current (a.k.a. most recently used!) controller family.
     * Can be used to determine which tooltips (gamepad buttons or keyboard indicators)
     * to show.qaa
     */
    public get currentControllerFamily(): ControllerFamily {
        return this[currentControllerFamilySymbol];
    }

}
