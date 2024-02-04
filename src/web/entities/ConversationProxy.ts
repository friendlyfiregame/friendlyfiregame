import { Conversation } from "../Conversation";
import { type EntityArgs } from "../Entity";
import { NPC } from "./NPC";

export interface ConversationProxyArgs extends EntityArgs {
    content?: string;
}

export class ConversationProxy extends NPC {
    public override conversation: Conversation;

    public constructor({ content, ...args }: ConversationProxyArgs) {
        super({ ...args, width: 16, height: 16 });

        this.conversation = this.generateConversation(this.prepareContent(content));
        this.scene.addGameObject(this);
    }

    private prepareContent(content?: string ): string[] {
        if (content == null) {
            return ["Nothing…"];
        }

        return content.split(":::");
    }

    private generateConversation(lines: string[]): Conversation {
        const json: Record<string, string[]> = { "entry": [] };

        lines.forEach((line, index) => {
            if (index === lines.length - 1) {
                line += " @entry !end";
            }

            json.entry.push(line);
        });

        return new Conversation(json, this);
    }

    public override render(): void {
        this.speechBubble.draw();
    }

    public override update(): void {
        if (!this.hasActiveConversation()) {
            this.scene.removeGameObject(this);
        }
    }
}
