import { entity } from "../../Entity";
import { Trigger, type TriggerArgs } from "./Trigger";

export interface ReadableArgs extends TriggerArgs {
    content?: string;
}

@entity("Readable")
export class Readable extends Trigger {
    public readonly content: string;

    public constructor({ content = "", ...args }: ReadableArgs) {
        super(args);
        this.content = content;
    }
}
