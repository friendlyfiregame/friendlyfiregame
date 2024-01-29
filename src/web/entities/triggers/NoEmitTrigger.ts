import { entity } from "../../Entity";
import { Trigger, type TriggerArgs } from "./Trigger";

export interface NoEmitTriggerArgs extends TriggerArgs {
    disableParticles?: boolean;
}

@entity("no_emit_trigger")
export class NoEmitTrigger extends Trigger {
    public readonly disableParticles: boolean;

    public constructor({ disableParticles = false, ...args }: NoEmitTriggerArgs) {
        super(args);
        this.disableParticles = disableParticles;
    }
}
