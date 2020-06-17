import { Signal } from "../Signal";
import { ControllerManager } from "./ControllerManager";
import { ControllerIntent } from "./ControllerIntent";
import { ControllerEvent } from "./ControllerEvent";
import { ControllerEventType } from "./ControllerEventType";
import { ControllerFamily } from "./ControllerFamily";

const keyToIntentMappings = new Map<string, ControllerIntent[]>();
keyToIntentMappings.set(" ", [ControllerIntent.PLAYER_JUMP]);
keyToIntentMappings.set("w", [ControllerIntent.PLAYER_JUMP, ControllerIntent.MENU_UP]);
keyToIntentMappings.set("a", [ControllerIntent.PLAYER_MOVE_LEFT, ControllerIntent.MENU_LEFT]);
keyToIntentMappings.set("s", [ControllerIntent.PLAYER_DROP, ControllerIntent.MENU_DOWN]);
keyToIntentMappings.set("d", [ControllerIntent.PLAYER_MOVE_RIGHT, ControllerIntent.MENU_RIGHT]);
keyToIntentMappings.set("ArrowUp", [ControllerIntent.PLAYER_JUMP, ControllerIntent.MENU_UP]);
keyToIntentMappings.set("ArrowDown", [ControllerIntent.PLAYER_DROP, ControllerIntent.MENU_DOWN]);
keyToIntentMappings.set("ArrowLeft", [ControllerIntent.PLAYER_MOVE_LEFT, ControllerIntent.MENU_LEFT]);
keyToIntentMappings.set("ArrowRight", [ControllerIntent.PLAYER_MOVE_RIGHT, ControllerIntent.MENU_RIGHT]);
keyToIntentMappings.set("Enter", [ControllerIntent.CONFIRM, ControllerIntent.PLAYER_INTERACT]);
keyToIntentMappings.set("Escape", [ControllerIntent.ABORT, ControllerIntent.PAUSE]);
keyToIntentMappings.set("e", [ControllerIntent.PLAYER_ACTION]);
keyToIntentMappings.set("f", [ControllerIntent.PLAYER_INTERACT]);
keyToIntentMappings.set("1", [ControllerIntent.PLAYER_DANCE_1]);
keyToIntentMappings.set("2", [ControllerIntent.PLAYER_DANCE_2]);

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
        this.onKeyPress.emit(event)
        this.controllerManager.onButtonPress.emit(new ControllerEvent(ControllerFamily.KEYBOARD, ControllerEventType.PRESS, keyToIntentMappings.get(event.key) || [ControllerIntent.NONE], event.repeat))
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (!event.repeat) {
            this.pressed.add(event.key);
        }
        this.onKeyDown.emit(event);
        this.controllerManager.onButtonDown.emit(new ControllerEvent(ControllerFamily.KEYBOARD, ControllerEventType.DOWN, keyToIntentMappings.get(event.key) || [ControllerIntent.NONE], event.repeat))
    }

    private handleKeyUp(event: KeyboardEvent): void {
        if (!event.repeat) {
            this.pressed.delete(event.key);
        }
        this.onKeyUp.emit(event);
        this.controllerManager.onButtonUp.emit(new ControllerEvent(ControllerFamily.KEYBOARD, ControllerEventType.UP, keyToIntentMappings.get(event.key) || [ControllerIntent.NONE], event.repeat))
    }

    public isPressed(key: string): boolean {
        return this.pressed.has(key);
    }
}
