import { entity } from "./Entity";
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { NPC } from './NPC';
import { GameObjectProperties } from './MapInfo';
import { Conversation } from './Conversation';

@entity("sign")
export class Sign extends NPC {
    @asset("sprites/sign.aseprite.json")
    private static sprite: Aseprite;
    public conversation: Conversation;

    public constructor(scene: GameScene, x: number, y:number, properties: GameObjectProperties) {
        super(scene, x, y, 16, 16);
        this.conversation = this.generateConversation(this.prepareContent(properties.content));
    }

    private prepareContent (content?: string ): string[] {
        if (!content) return ['The sign is empty.'];
        return content.split(":::");
    }

    public getInteractionText (): string {
        return "Read sign";
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
        ctx.save();
        ctx.translate(this.x, -this.y);
        Sign.sprite.drawTag(ctx, "idle", -Sign.sprite.width >> 1, -Sign.sprite.height,
            this.scene.gameTime * 1000);
        ctx.restore();
        if (this.scene.showBounds) this.drawBounds(ctx);
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {}
}
