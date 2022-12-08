import { ControllerEventType } from "./ControllerEventType";
import { ControllerFamily } from "./ControllerFamily";
import { ControllerIntent } from "./ControllerIntent";
import { GamepadModel } from "./GamepadModel";

const controllerFamilySymbol = Symbol("controllerFamily");
const intentsSymbol = Symbol("intent");
const eventTypeSymbol = Symbol("eventType");
const repeatSymbol = Symbol("repeat");

export class ControllerEvent extends Object {
    private [controllerFamilySymbol]: ControllerFamily;
    private [intentsSymbol]: ControllerIntent;
    private [eventTypeSymbol]: ControllerEventType;
    private [repeatSymbol]: boolean;

    constructor(
        controllerFamily: ControllerFamily, eventType: ControllerEventType,
        intents: ControllerIntent[], repeat: boolean = false
    ) {
        super();

        this[controllerFamilySymbol] = controllerFamily;
        this[intentsSymbol] = intents.reduce((prev, curr) => prev | curr);
        this[eventTypeSymbol] = eventType;
        this[repeatSymbol] = repeat;
    }

    get controllerFamily(): ControllerFamily {
        return this[controllerFamilySymbol];
    }

    get eventType(): ControllerEventType {
        return this[eventTypeSymbol];
    }

    get repeat(): boolean {
        return this[repeatSymbol];
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

    get isPlayerEnterDoor(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_ENTER_DOOR) === ControllerIntent.PLAYER_ENTER_DOOR;
    }

    get isPlayerInteract(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_INTERACT) === ControllerIntent.PLAYER_INTERACT;
    }

    get isPlayerAction(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_ACTION) === ControllerIntent.PLAYER_ACTION;
    }

    get isPlayerRun(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_RUN) === ControllerIntent.PLAYER_RUN;
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

const gamepadModelSymbol = Symbol("gamepadModel");

export class GamepadControllerEvent extends ControllerEvent {
    private [gamepadModelSymbol]: GamepadModel;
    constructor(gamepadModel: GamepadModel, eventType: ControllerEventType, intents: ControllerIntent[], repeat: boolean = false) {
        super(ControllerFamily.GAMEPAD, eventType, intents, repeat);
        this[gamepadModelSymbol] = gamepadModel;
    }
    get gamepadModel(): GamepadModel {
        return this[gamepadModelSymbol];
    }
}
