import { entity } from "../../Entity";
import { Trigger, type TriggerArgs } from "./Trigger";

export interface TeleporterArgs extends TriggerArgs {
    teleportY?: number;
}

@entity("teleporter")
export class Teleporter extends Trigger {
    public readonly teleportY: number;

    public constructor({ teleportY = 0, ...args }: TeleporterArgs) {
        super(args);
        this.teleportY = teleportY;
    }
}
