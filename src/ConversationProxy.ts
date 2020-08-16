import { Conversation } from './Conversation';
import { GameObjectProperties } from './MapInfo';
import { GameScene } from './scenes/GameScene';
import { NPC } from './NPC';
import { Point, Size } from './Geometry';

export class ConversationProxy extends NPC {
    public conversation: Conversation;

    public constructor(scene: GameScene, position: Point, properties: GameObjectProperties) {
        super(scene, position, new Size(16, 16));
        this.conversation = this.generateConversation(this.prepareContent(properties.content));
        this.scene.addGameObject(this);
    }

    private prepareContent (content?: string ): string[] {
        if (!content) return ['Nothing…'];
        return content.split(":::");
    }

    private generateConversation (lines: string[]): Conversation {
        const json: Record<string, string[]> = { "entry": [] }
        lines.forEach((line, index) => {
            if (index === lines.length - 1) {
                line += " @entry !end";
            }
            json.entry.push(line);
        })
        return new Conversation(json, this);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.scene.showBounds) this.drawBounds();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        if (!this.hasActiveConversation()) {
            this.scene.removeGameObject(this);
        }
    }
}
