import { type ControllerEventType } from "./ControllerEventType";
import { ControllerFamily } from "./ControllerFamily";
import { ControllerIntent } from "./ControllerIntent";
import { type GamepadModel } from "./GamepadModel";

export class ControllerEvent extends Object {
    readonly #controllerFamily: ControllerFamily;
    readonly #intents: ControllerIntent;
    readonly #eventType: ControllerEventType;
    readonly #repeat: boolean;

    public constructor(
        controllerFamily: ControllerFamily, eventType: ControllerEventType,
        intents: ControllerIntent[], repeat: boolean = false
    ) {
        super();

        this.#controllerFamily = controllerFamily;
        this.#intents= intents.reduce((prev, curr) => prev | curr);
        this.#eventType = eventType;
        this.#repeat = repeat;
    }

    public get controllerFamily(): ControllerFamily {
        return this.#controllerFamily;
    }

    public get eventType(): ControllerEventType {
        return this.#eventType;
    }

    public get repeat(): boolean {
        return this.#repeat;
    }

    public get isMenuLeft(): boolean {
        return (this.#intents & ControllerIntent.MENU_LEFT) !== 0;
    }

    public get isMenuRight(): boolean {
        return (this.#intents & ControllerIntent.MENU_RIGHT) !== 0;
    }

    public get isMenuUp(): boolean {
        return (this.#intents & ControllerIntent.MENU_UP) !== 0;
    }

    public get isMenuDown(): boolean {
        return (this.#intents & ControllerIntent.MENU_DOWN) !== 0;
    }

    public get isPlayerMoveLeft(): boolean {
        return (this.#intents & ControllerIntent.PLAYER_MOVE_LEFT) !== 0;
    }

    public get isPlayerMoveRight(): boolean {
        return (this.#intents & ControllerIntent.PLAYER_MOVE_RIGHT) !== 0;
    }

    public get isPlayerJump(): boolean {
        return (this.#intents & ControllerIntent.PLAYER_JUMP) !== 0;
    }

    public get isPlayerDrop(): boolean {
        return (this.#intents & ControllerIntent.PLAYER_DROP) !== 0;
    }

    public get isPlayerEnterDoor(): boolean {
        return (this.#intents & ControllerIntent.PLAYER_ENTER_DOOR) !== 0;
    }

    public get isPlayerInteract(): boolean {
        return (this.#intents & ControllerIntent.PLAYER_INTERACT) !== 0;
    }

    public get isPlayerAction(): boolean {
        return (this.#intents & ControllerIntent.PLAYER_ACTION) !== 0;
    }

    public get isPlayerRun(): boolean {
        return (this.#intents & ControllerIntent.PLAYER_RUN) !== 0;
    }

    public get isPlayerDance1(): boolean {
        return (this.#intents & ControllerIntent.PLAYER_DANCE_1) !== 0;
    }

    public get isPlayerDance2(): boolean {
        return (this.#intents & ControllerIntent.PLAYER_DANCE_2) !== 0;
    }

    public get isPause(): boolean {
        return (this.#intents & ControllerIntent.PAUSE) !== 0;
    }

    public get isConfirm(): boolean {
        return (this.#intents & ControllerIntent.CONFIRM) !== 0;
    }

    public get isAbort(): boolean {
        return (this.#intents & ControllerIntent.ABORT) !== 0;
    }
}

export class GamepadControllerEvent extends ControllerEvent {
    readonly #gamepadModel: GamepadModel;

    public constructor(gamepadModel: GamepadModel, eventType: ControllerEventType, intents: ControllerIntent[], repeat: boolean = false) {
        super(ControllerFamily.GAMEPAD, eventType, intents, repeat);
        this.#gamepadModel = gamepadModel;
    }

    public get gamepadModel(): GamepadModel {
        return this.#gamepadModel;
    }
}
