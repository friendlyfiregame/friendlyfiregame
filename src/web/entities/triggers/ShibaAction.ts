import { entity } from "../../Entity";
import { Trigger, type TriggerArgs } from "./Trigger";

export interface ShibaActionArgs extends TriggerArgs {
    velocity?: number | null;
}

@entity("shiba_action")
export class ShibaAction extends Trigger {
    public readonly velocity: number | null;

    public constructor({ velocity = null, ...args }: ShibaActionArgs) {
        super(args);
        this.velocity = velocity;
    }
}
