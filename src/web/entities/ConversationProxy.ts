import { Conversation } from "../Conversation";
import { type EntityArgs } from "../Entity";
import { NPC } from "./NPC";

export class ConversationProxy extends NPC {
    public override conversation: Conversation;

    public constructor(args: EntityArgs) {
        super({ width: 16, height: 16, ...args });

        this.conversation = this.generateConversation(this.prepareContent(this.properties.content));
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

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.scene.showBounds) this.drawBounds();
        this.speechBubble.draw(ctx);
    }

    public override update(): void {
        if (!this.hasActiveConversation()) {
            this.scene.removeGameObject(this);
        }
    }
}
