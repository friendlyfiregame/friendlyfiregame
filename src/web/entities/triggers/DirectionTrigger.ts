import { entity } from "../../Entity";
import { Trigger, type TriggerArgs } from "./Trigger";

export interface DirectionTriggerArgs extends TriggerArgs {
    direction?: number | null;
}

@entity("DirectionTrigger")
export class DirectionTrigger extends Trigger {
    public readonly direction: number | null;

    public constructor({ direction = null, ...args }: DirectionTriggerArgs) {
        super({ ...args, isTrigger: true });
        this.direction = direction;
    }
}
