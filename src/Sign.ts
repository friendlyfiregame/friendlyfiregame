import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { Conversation } from "./Conversation";
import { entity } from "./Entity";
import { GameObjectProperties } from "./MapInfo";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import { RenderingLayer } from "./RenderingLayer";

@entity("sign")
export class Sign extends NPC {
    @asset("sprites/sign.aseprite.json")
    private static sprite: Aseprite;
    public conversation: Conversation;

    public constructor(scene: GameScene, x: number, y: number, properties: GameObjectProperties) {
        super(scene, x, y, 16, 16);
        this.setLayer(RenderingLayer.ENTITIES);
        this.conversation = this.generateConversation(this.prepareContent(properties.content));
    }

    private prepareContent(content?: string ): string[] {
        if (!content) {
            return ["The sign is empty."];
        }

        return content.split(":::");
    }

    public getInteractionText(): string {
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
        Sign.sprite.drawTag(ctx, "idle", -Sign.sprite.width >> 1, -Sign.sprite.height);
    }

    public update(): void {
        // Intentionally not calling parent here. This "NPC" must not have physics.
    }
}
