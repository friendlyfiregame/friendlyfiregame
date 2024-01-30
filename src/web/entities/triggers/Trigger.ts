import { Entity, entity, type EntityArgs } from "../../Entity";

export interface TriggerArgs extends EntityArgs {
    setGlobalKey?: string | null;
    setGlobalVal?: string | null;
    setDialogEntity?: string | null;
    setDialogValue?: string | null;
}

@entity("Trigger")
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
        super(args);
        this.setGlobalKey = setGlobalKey;
        this.setGlobalVal = setGlobalVal;
        this.setDialogEntity = setDialogEntity;
        this.setDialogValue = setDialogValue;
    }
}
