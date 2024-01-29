import { entity } from "../../Entity";
import { Trigger, type TriggerArgs } from "./Trigger";

export interface MountainGateArgs extends TriggerArgs {
    row?: number;
    col?: number;
}

@entity("mountaingate")
export class MountainGate extends Trigger {
    public readonly row: number;
    public readonly col: number;

    public constructor({ row = 0, col = 0, ...args }: MountainGateArgs) {
        super(args);
        this.row = row;
        this.col = col;
    }
}
