import { VirtualKeyboardEvent } from "./GamepadInput";
import { ControllerType } from "./ControllerType";

/** Symbol to identify the current/active controller type */
const currentControllerTypeSymbol = Symbol("currentControllerType");

export class ControllerManager {

    private [currentControllerTypeSymbol]: ControllerType;
    public constructor(initialControllerType: ControllerType = ControllerType.KEYBOARD) {
        this.currentControllerType = initialControllerType;
        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e instanceof VirtualKeyboardEvent) {
                if (this.currentControllerType !== ControllerType.GAMEPAD) {
                    this.currentControllerType = ControllerType.GAMEPAD;
                }
            } else if (this.currentControllerType !== ControllerType.KEYBOARD) {
                this.currentControllerType = ControllerType.KEYBOARD;
            }
        });
    }

    public set currentControllerType(controllerType: ControllerType) {
        this[currentControllerTypeSymbol] = controllerType;
        console.info(`New active controller type: ${this.currentControllerType}`);
    }

    public get currentControllerType(): ControllerType {
        return this[currentControllerTypeSymbol];
    }

}
