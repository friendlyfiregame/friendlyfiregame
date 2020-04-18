import { DummyNPC } from "./DummyNPC";
import { Player } from "./Player";
import { SpeechBubble } from "./SpeechBubble";
import { Subscription } from "rxjs";

export interface Message { entity: "player" | "other", text: string, actionPaths?: Map<string,Array<Message>> };

export class Dialog {
    private dialogIndex = 0;
    private messageToShow: Message | null = null;
    private actionPathSubscription: Subscription | null = null;

    constructor(private messages: Array<Message>, private player: Player, private entity: DummyNPC) { }

    public getNextMessage(takenPath?: string): boolean {
        if (takenPath) {
            this.messages = this.messageToShow?.actionPaths?.get(takenPath) ?? [];
            this.dialogIndex = 0;
            this.messageToShow =  this.messages[this.dialogIndex];
            this.dialogIndex++;
            return true
        }
        if (this.dialogIndex >= 0 && this.dialogIndex < this.messages.length) {
            this.messageToShow =  this.messages[this.dialogIndex];
            this.dialogIndex++;
            return true
        }
        this.messageToShow = null;
        return false;
    }

    public getSpeechBubbleForEntity(): SpeechBubble | null {
        if (this.messageToShow?.entity === "other") {
            this.actionPathSubscription?.unsubscribe();
            this.actionPathSubscription = null;
            const speechBubble = new SpeechBubble(this.entity.game, this.entity.x, this.entity.y + 40, "white", true, this.messageToShow.text, this.messageToShow.actionPaths);
            this.actionPathSubscription = speechBubble.onActionPathTaken.subscribe(actionPaths => {
                this.messages = actionPaths;
                this.dialogIndex = 0;
                this.messageToShow = this.messages[0];
            });

            return speechBubble;
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
