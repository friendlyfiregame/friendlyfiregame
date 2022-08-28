import { Conversation } from "./Conversation";
import { GameObjectProperties } from "./MapInfo";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./entities/NPC";
import { LevelId } from "./Levels";

export class ConversationProxy extends NPC {
    public conversation: Conversation;

    public constructor(scene: GameScene, x: number, y: number, levelId: LevelId, properties: GameObjectProperties) {
        super(scene, x, y, 16, 16, levelId);

        this.conversation = this.generateConversation(this.prepareContent(properties.content));
        this.scene.addGameObject(this);
    }

    private prepareContent(content?: string ): string[] {
        if (!content) {
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

    public update(): void {
        if (!this.hasActiveConversation()) {
            this.scene.removeGameObject(this);
        }
    }
}
