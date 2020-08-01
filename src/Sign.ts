import { entity } from "./Entity";
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { NPC } from './NPC';
import { GameObjectProperties } from './MapInfo';
import { Conversation } from './Conversation';
import { RenderingType, RenderingLayer } from './RenderingQueue';

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
        if (!content) return ['The sign is empty'];
        return content.split(":::");
    }

    public getInteractionText (): string {
        return "Read Sign";
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
        this.scene.renderer.add({
            type: RenderingType.ASEPRITE,
            layer: RenderingLayer.ENTITIES,
            translation: { x: this.x, y: -this.y },
            position: {
                x: -Sign.sprite.width >> 1,
                y: -Sign.sprite.height
            },
            asset: Sign.sprite,
            animationTag: "idle",
            time: this.scene.gameTime * 1000
        })
        
        if (this.scene.showBounds) this.drawBounds();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {}
}
