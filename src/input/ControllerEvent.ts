import { ControllerFamily } from "./ControllerFamily";
import { ControllerEventType } from "./ControllerEventType";
import { ControllerIntent } from "./ControllerIntent";

const controllerFamilySymbol = Symbol("controllerFamily");
const intentsSymbol = Symbol("intent");
const eventTypeSymbol = Symbol("eventType");

export class ControllerEvent {
    private [controllerFamilySymbol]: ControllerFamily;
    private [intentsSymbol]: ControllerIntent;
    private [eventTypeSymbol]: ControllerEventType;

    constructor(controllerFamily: ControllerFamily, eventType: ControllerEventType, intents: ControllerIntent[]) {
        this[controllerFamilySymbol] = controllerFamily;
        this[intentsSymbol] = intents.reduce((prev, curr) => prev | curr);
        this[eventTypeSymbol] = eventType;
    }

    get controllerFamily(): ControllerFamily {
        return this[controllerFamilySymbol];
    }

    get eventType(): ControllerEventType {
        return this[eventTypeSymbol];
    }

    get isMenuLeft(): boolean {
        return (this[intentsSymbol] & ControllerIntent.MENU_LEFT) === ControllerIntent.MENU_LEFT;
    }

    get isMenuRight(): boolean {
        return (this[intentsSymbol] & ControllerIntent.MENU_RIGHT) === ControllerIntent.MENU_RIGHT;
    }

    get isMenuUp(): boolean {
        return (this[intentsSymbol] & ControllerIntent.MENU_UP) === ControllerIntent.MENU_UP;
    }

    get isMenuDown(): boolean {
        return (this[intentsSymbol] & ControllerIntent.MENU_DOWN) === ControllerIntent.MENU_DOWN;
    }

    get isPlayerMoveLeft(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_MOVE_LEFT) === ControllerIntent.PLAYER_MOVE_LEFT;
    }

    get isPlayerMoveRight(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_MOVE_RIGHT) === ControllerIntent.PLAYER_MOVE_RIGHT;
    }

    get isPlayerJump(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_JUMP) === ControllerIntent.PLAYER_JUMP;
    }

    get isPlayerDrop(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_DROP) === ControllerIntent.PLAYER_DROP;
    }

    get isPlayerInteract(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_INTERACT) === ControllerIntent.PLAYER_INTERACT;
    }

    get isPlayerDance1(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_DANCE_1) === ControllerIntent.PLAYER_DANCE_1;
    }

    get isPlayerDance2(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_DANCE_2) === ControllerIntent.PLAYER_DANCE_2;
    }

    get isPause(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PAUSE) === ControllerIntent.PAUSE;
    }

    get isConfirm(): boolean {
        return (this[intentsSymbol] & ControllerIntent.CONFIRM) === ControllerIntent.CONFIRM;
    }

    get isAbort(): boolean {
        return (this[intentsSymbol] & ControllerIntent.ABORT) === ControllerIntent.ABORT;
    }

}
