import { NPC } from './NPC';
import texts, { ScriptedDialogJSON } from "../assets/dummy.texts.json";
/**
 * possible actions:
 * dialog _key_ - jump to npc dialog with key _key_
 * state add/remove _value_ - add/remove _value_ from campaignstate
 * face _mode_ - set the face mode
 * camera zoomin/zoomout
 * no action on an option will end the dialog
 */


export class ScriptedDialog {
    public static Texts = texts;

    constructor(public npc: NPC, private dialogData: ScriptedDialogJSON) {
        console.log(this.dialogData);
    }
}
