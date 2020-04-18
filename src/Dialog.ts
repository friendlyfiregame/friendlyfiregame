import { DummyNPC } from "./DummyNPC";
import { Player } from "./Player";
import { SpeechBubble } from "./SpeechBubble";

export interface Message { entity: "player" | "other", text: string };

export class Dialog {
    private dialogIndex = 0;
    private messageToShow: Message | null = null;

    constructor(private messages: Array<Message>, private player: Player, private entity: DummyNPC) { }

    public getNextMessage(): boolean {
        console.log(this.dialogIndex, this.messages.length);
        if (this.dialogIndex >= 0 && this.dialogIndex < this.messages.length) {
            console.log("Get next message");
            this.messageToShow =  this.messages[this.dialogIndex];
            this.dialogIndex++;
            return true
        }
        this.messageToShow = null;
        return false;
    }

    public getSpeechBubbleForEntity(): SpeechBubble | null {
        console.log(this.messageToShow);
        if (this.messageToShow?.entity === "other") {
            return new SpeechBubble(this.entity.game, this.entity.x, this.entity.y + 40, "white", true, this.messageToShow.text);
        }
        return null;
    }

    public getSpeechBubbleForPlayer(): SpeechBubble | null {
        if (this.messageToShow?.entity === "player") {
            return new SpeechBubble(this.player.game, this.player.x, this.player.y + 40, "#FFBBBB", true, this.messageToShow.text);
        }
        return null;
    }

}
