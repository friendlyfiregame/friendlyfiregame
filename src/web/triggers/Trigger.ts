import { Entity, type EntityArgs } from "../Entity";
import { type Constructor } from "../util/types";

const triggers = new Map<string, Constructor<Trigger>>();

export function trigger(name: string): (target: Constructor<Trigger>) => void {
    return (type: Constructor<Trigger>) => {
        triggers.set(name, type);
    };
}

export function createTrigger(name: string, args: TriggerArgs): Trigger {
    const constructor = triggers.get(name);

    if (!constructor) {
        throw new Error("Trigger not found: " + name);
    }

    return new constructor(args);
}

export interface TriggerArgs extends EntityArgs {
    setGlobalKey?: string | null;
    setGlobalVal?: string | null;
    setDialogEntity?: string | null;
    setDialogValue?: string | null;
}

export class Trigger extends Entity {
    public readonly setGlobalKey: string | null;
    public readonly setGlobalVal: string | null;
    public readonly setDialogEntity: string | null;
    public readonly setDialogValue: string | null;

    public constructor({
        setGlobalKey = null,
        setGlobalVal = null,
        setDialogEntity = null,
        setDialogValue = null,
        ...args
    }: TriggerArgs) {
        super({ isTrigger: true, ... args });
        this.setGlobalKey = setGlobalKey;
        this.setGlobalVal = setGlobalVal;
        this.setDialogEntity = setDialogEntity;
        this.setDialogValue = setDialogValue;
    }
}
