import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import { entity, type EntityArgs } from "../Entity";
import { RenderingLayer, RenderingType } from "../Renderer";
import { NPC } from "./NPC";

export interface SignArgs extends EntityArgs {
    content?: string;
}

@entity("Sign")
export class Sign extends NPC {
    @asset("sprites/sign.aseprite.json")
    private static readonly sprite: Aseprite;
    public override conversation: Conversation;

    public constructor({ content, ...args }: SignArgs) {
        super({ ...args, width: 16, height: 16 });
        this.conversation = this.generateConversation(this.prepareContent(content));
    }

    private prepareContent(content?: string): string[] {
        if (content == null) {
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

    public override render(): void {
        this.scene.renderer.add({
            type: RenderingType.ASEPRITE,
            layer: RenderingLayer.ENTITIES,
            translation: { x: this.x, y: this.y },
            position: {
                x: -Sign.sprite.width >> 1,
                y: -Sign.sprite.height
            },
            asset: Sign.sprite,
            animationTag: "idle",
            time: this.scene.gameTime * 1000
        });

        this.speechBubble.draw();
    }

    public override update(): void {}
}
