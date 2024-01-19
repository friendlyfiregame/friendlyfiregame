import { Signal } from "../Signal";
import { ControllerEvent } from "./ControllerEvent";
import { ControllerEventType } from "./ControllerEventType";
import { ControllerFamily } from "./ControllerFamily";
import { ControllerIntent } from "./ControllerIntent";
import { ControllerManager } from "./ControllerManager";

const preventDefaultKeyCodes: string[] = [
    "ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Space"
];

const keyToIntentMappings = new Map<string, ControllerIntent[]>();

keyToIntentMappings.set("Space", [ControllerIntent.PLAYER_JUMP]);
keyToIntentMappings.set("KeyW", [ControllerIntent.PLAYER_ENTER_DOOR, ControllerIntent.MENU_UP]);
keyToIntentMappings.set("KeyA", [ControllerIntent.PLAYER_MOVE_LEFT, ControllerIntent.MENU_LEFT]);
keyToIntentMappings.set("KeyS", [ControllerIntent.PLAYER_DROP, ControllerIntent.MENU_DOWN]);
keyToIntentMappings.set("KeyD", [ControllerIntent.PLAYER_MOVE_RIGHT, ControllerIntent.MENU_RIGHT]);
keyToIntentMappings.set("ArrowUp", [ControllerIntent.PLAYER_ENTER_DOOR, ControllerIntent.MENU_UP]);
keyToIntentMappings.set("ArrowDown", [ControllerIntent.PLAYER_DROP, ControllerIntent.MENU_DOWN]);
keyToIntentMappings.set("ArrowLeft", [ControllerIntent.PLAYER_MOVE_LEFT, ControllerIntent.MENU_LEFT]);
keyToIntentMappings.set("ArrowRight", [ControllerIntent.PLAYER_MOVE_RIGHT, ControllerIntent.MENU_RIGHT]);
keyToIntentMappings.set("Enter", [ControllerIntent.PLAYER_INTERACT, ControllerIntent.CONFIRM]);
keyToIntentMappings.set("NumpadEnter", [ControllerIntent.PLAYER_INTERACT, ControllerIntent.CONFIRM]);
keyToIntentMappings.set("Escape", [ControllerIntent.ABORT, ControllerIntent.PAUSE]);
keyToIntentMappings.set("ShiftLeft", [ControllerIntent.PLAYER_RUN]);
keyToIntentMappings.set("ShiftRight", [ControllerIntent.PLAYER_RUN]);
keyToIntentMappings.set("KeyE", [ControllerIntent.PLAYER_INTERACT, ControllerIntent.CONFIRM]);
keyToIntentMappings.set("KeyF", [ControllerIntent.PLAYER_ACTION]);
keyToIntentMappings.set("Digit1", [ControllerIntent.PLAYER_DANCE_1]);
keyToIntentMappings.set("Digit2", [ControllerIntent.PLAYER_DANCE_2]);
keyToIntentMappings.set("Numpad1", [ControllerIntent.PLAYER_DANCE_1]);
keyToIntentMappings.set("Numpad2", [ControllerIntent.PLAYER_DANCE_2]);

export class Keyboard {
    public readonly onKeyDown = new Signal<KeyboardEvent>();
    public readonly onKeyUp = new Signal<KeyboardEvent>();
    public readonly onKeyPress = new Signal<KeyboardEvent>();
    private readonly pressed = new Set<string>();
    private readonly controllerManager = ControllerManager.getInstance();

    public constructor() {
        document.addEventListener("keypress", event => this.handleKeyPress(event));
        document.addEventListener("keydown", event => this.handleKeyDown(event));
        document.addEventListener("keyup", event => this.handleKeyUp(event));
    }

    private handleKeyPress(event: KeyboardEvent): void {
        this.onKeyPress.emit(event);

        // Quick workaround to make sure, that modifier keys never trigger a game-related
        // controller event. Especially necessary to make other non-game related actions
        // possible. (Shift is used as a modifier key to enable running and is therefore
        // excluded from the list below)
        if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }

        this.controllerManager.onButtonPress.emit(
            new ControllerEvent(
                ControllerFamily.KEYBOARD, ControllerEventType.PRESS,
                keyToIntentMappings.get(event.code) ?? [ControllerIntent.NONE], event.repeat
            )
        );
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (preventDefaultKeyCodes.includes(event.code)) {
            event.preventDefault();
        }

        if (!event.repeat) {
            this.pressed.add(event.key);
        }

        this.onKeyDown.emit(event);

        if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }

        this.controllerManager.onButtonDown.emit(
            new ControllerEvent(
                ControllerFamily.KEYBOARD, ControllerEventType.DOWN,
                keyToIntentMappings.get(event.code) ?? [ControllerIntent.NONE], event.repeat
            )
        );
    }

    private handleKeyUp(event: KeyboardEvent): void {
        if (!event.repeat) {
            this.pressed.delete(event.key);
        }

        this.onKeyUp.emit(event);

        if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }

        this.controllerManager.onButtonUp.emit(
            new ControllerEvent(
                ControllerFamily.KEYBOARD, ControllerEventType.UP,
                keyToIntentMappings.get(event.code) ?? [ControllerIntent.NONE], event.repeat
            )
        );
    }

    public isPressed(key: string): boolean {
        return this.pressed.has(key);
    }
}
