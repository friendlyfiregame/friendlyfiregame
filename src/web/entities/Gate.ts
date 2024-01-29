import { Entity, entity, type EntityArgs } from "../Entity";

export interface GateArgs extends EntityArgs {
    disabled?: boolean;
    target?: string | null;
    bgm?: string | null;
    enterSound?: string | null;
    exitSound?: string | null;
    exitSleepTime?: number | null;
    exitFadeTime?: number | null;
}

@entity("gate")
export class Gate extends Entity {
    #disabled: boolean;
    public readonly target: string | null;
    public readonly bgm: string | null;
    public readonly enterSound: string | null;
    public readonly exitSound: string | null;
    public readonly exitSleepTime: number | null;
    public readonly exitFadeTime: number | null;

    public constructor({
        disabled = false,
        target = null,
        bgm = null,
        enterSound = null,
        exitSound = null,
        exitSleepTime = null,
        exitFadeTime = null,
        ...args
    }: GateArgs) {
        super(args);
        this.#disabled = disabled;
        this.target = target;
        this.bgm = bgm;
        this.enterSound = enterSound;
        this.exitSound = exitSound;
        this.exitSleepTime = exitSleepTime;
        this.exitFadeTime = exitFadeTime;
    }

    public disable(): void {
        this.#disabled = true;
    }

    public enable(): void {
        this.#disabled = false;
    }

    public get disabled(): boolean {
        return this.#disabled;
    }
}
