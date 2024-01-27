import { Trigger, trigger, type TriggerArgs } from "./Trigger";

export interface ReadableArgs extends TriggerArgs {
    content?: string;
}

@trigger("readable")
export class Readable extends Trigger {
    public readonly content: string;

    public constructor({ content = "", ...args }: ReadableArgs) {
        super(args);
        this.content = content;
    }
}
