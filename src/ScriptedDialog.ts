import { NPC } from './NPC';
import texts, { ScriptedDialogJSON } from "../assets/dummy.texts.json";

export class ScriptedDialog {
    public static Texts = texts;

    constructor(public npc: NPC, private dialogData: ScriptedDialogJSON) {
        console.log(this.dialogData);
    }
}
