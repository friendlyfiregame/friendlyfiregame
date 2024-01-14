import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import { entity } from "../Entity";
import { GameObjectProperties } from "../MapInfo";
import { GameScene } from "../scenes/GameScene";
import { NPC } from "./NPC";
import { RenderingLayer, RenderingType } from "../Renderer";

@entity("sign")
export class Sign extends NPC {
    @asset("sprites/sign.aseprite.json")
    private static readonly sprite: Aseprite;
    public override conversation: Conversation;

    public constructor(scene: GameScene, x: number, y: number, properties: GameObjectProperties) {
        super(scene, x, y, 16, 16);
        this.conversation = this.generateConversation(this.prepareContent(properties.content));
    }

    private prepareContent(content?: string ): string[] {
        if (!content) {
            return ["The sign is empty."];
        }

        return content.split(":::");
    }

    public override getInteractionText(): string {
        return "Read sign";
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
        });

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        this.speechBubble.draw(ctx);
    }

    public override update(): void {}
}
