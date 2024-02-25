import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import { entity, type EntityArgs } from "../Entity";
import { Direction } from "../geom/Direction";
import { RenderingLayer } from "../Renderer";
import { AsepriteNode } from "../scene/AsepriteNode";
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
        super({ ...args, width: Sign.sprite.width, height: Sign.sprite.height });
        this.conversation = this.generateConversation(this.prepareContent(content));
        this.appendChild(new AsepriteNode({
            aseprite: Sign.sprite,
            tag: "idle",
            layer: RenderingLayer.ENTITIES,
            anchor: Direction.BOTTOM,
            x: -1
        }));
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
        this.speechBubble.draw();
    }

    public override update(): void {}
}
