import { entity } from "../../Entity";
import { Trigger, type TriggerArgs } from "./Trigger";

export interface FlameBoyActionArgs extends TriggerArgs {
    velocity?: number | null;
}

@entity("flameboy_action")
export class FlameBoyAction extends Trigger {
    public readonly velocity: number | null;

    public constructor({ velocity = null, ...args }: FlameBoyActionArgs) {
        super(args);
        this.velocity = velocity;
    }
}
