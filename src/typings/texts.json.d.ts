declare module "*.texts.json" {
    export interface ScriptedDialogJSON {
        greetings: GreetingsJSON;
        dialogs: DialogsJSON;
    }

    export interface GreetingsJSON {
        [states: string]: string[];
    }

    export interface DialogsJSON {
        [key: string]: DialogJSON;
    }

    export interface DialogJSON {
        text: string,
        options?: DialogOption[];
        dialogs?: DialogsJSON;
    }

    export interface DialogOption {
        text: string;
        /**
         * possible actions:
         * dialog _key_ - jump to npc dialog with key _key_
         * state add/remove _value_ - add/remove _value_ from campaign state
         * face _mode_ - set the face mode
         * camera zoomin/zoomout
         * no action on an option will end the dialog
         */
        actions: string[];
    }

    const value: ScriptedDialogJSON;
    export default value;
}
