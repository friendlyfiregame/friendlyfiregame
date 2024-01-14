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

    public constructor(
        controllerFamily: ControllerFamily, eventType: ControllerEventType,
        intents: ControllerIntent[], repeat: boolean = false
    ) {
        super();

        this[controllerFamilySymbol] = controllerFamily;
        this[intentsSymbol] = intents.reduce((prev, curr) => prev | curr);
        this[eventTypeSymbol] = eventType;
        this[repeatSymbol] = repeat;
    }

    public get controllerFamily(): ControllerFamily {
        return this[controllerFamilySymbol];
    }

    public get eventType(): ControllerEventType {
        return this[eventTypeSymbol];
    }

    public get repeat(): boolean {
        return this[repeatSymbol];
    }

    public get isMenuLeft(): boolean {
        return (this[intentsSymbol] & ControllerIntent.MENU_LEFT) === ControllerIntent.MENU_LEFT;
    }

    public get isMenuRight(): boolean {
        return (this[intentsSymbol] & ControllerIntent.MENU_RIGHT) === ControllerIntent.MENU_RIGHT;
    }

    public get isMenuUp(): boolean {
        return (this[intentsSymbol] & ControllerIntent.MENU_UP) === ControllerIntent.MENU_UP;
    }

    public get isMenuDown(): boolean {
        return (this[intentsSymbol] & ControllerIntent.MENU_DOWN) === ControllerIntent.MENU_DOWN;
    }

    public get isPlayerMoveLeft(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_MOVE_LEFT) === ControllerIntent.PLAYER_MOVE_LEFT;
    }

    public get isPlayerMoveRight(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_MOVE_RIGHT) === ControllerIntent.PLAYER_MOVE_RIGHT;
    }

    public get isPlayerJump(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_JUMP) === ControllerIntent.PLAYER_JUMP;
    }

    public get isPlayerDrop(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_DROP) === ControllerIntent.PLAYER_DROP;
    }

    public get isPlayerEnterDoor(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_ENTER_DOOR) === ControllerIntent.PLAYER_ENTER_DOOR;
    }

    public get isPlayerInteract(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_INTERACT) === ControllerIntent.PLAYER_INTERACT;
    }

    public get isPlayerAction(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_ACTION) === ControllerIntent.PLAYER_ACTION;
    }

    public get isPlayerRun(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_RUN) === ControllerIntent.PLAYER_RUN;
    }

    public get isPlayerDance1(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_DANCE_1) === ControllerIntent.PLAYER_DANCE_1;
    }

    public get isPlayerDance2(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PLAYER_DANCE_2) === ControllerIntent.PLAYER_DANCE_2;
    }

    public get isPause(): boolean {
        return (this[intentsSymbol] & ControllerIntent.PAUSE) === ControllerIntent.PAUSE;
    }

    public get isConfirm(): boolean {
        return (this[intentsSymbol] & ControllerIntent.CONFIRM) === ControllerIntent.CONFIRM;
    }

    public get isAbort(): boolean {
        return (this[intentsSymbol] & ControllerIntent.ABORT) === ControllerIntent.ABORT;
    }
}

const gamepadModelSymbol = Symbol("gamepadModel");

export class GamepadControllerEvent extends ControllerEvent {
    private [gamepadModelSymbol]: GamepadModel;

    public constructor(gamepadModel: GamepadModel, eventType: ControllerEventType, intents: ControllerIntent[], repeat: boolean = false) {
        super(ControllerFamily.GAMEPAD, eventType, intents, repeat);
        this[gamepadModelSymbol] = gamepadModel;
    }

    public get gamepadModel(): GamepadModel {
        return this[gamepadModelSymbol];
    }
}
