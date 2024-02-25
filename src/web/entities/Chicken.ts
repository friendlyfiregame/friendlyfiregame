import conversation from "../../../assets/dialog/chicken.dialog.json";
import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import { entity, type EntityArgs } from "../Entity";
import { Direction } from "../geom/Direction";
import { RenderingLayer } from "../Renderer";
import { AsepriteNode } from "../scene/AsepriteNode";
import { NPC } from "./NPC";

@entity("Chicken")
export class Chicken extends NPC {
    @asset("sprites/chicken.aseprite.json")
    private static readonly sprite: Aseprite;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 24, height: 18 });
        this.lookAtPlayer = false;
        this.conversation = new Conversation(conversation, this);
        this.appendChild(new AsepriteNode({
            aseprite: Chicken.sprite,
            tag: "idle",
            layer: RenderingLayer.ENTITIES,
            anchor: Direction.BOTTOM
        }));
    }

    public override getInteractionText(): string {
        if (!this.met) {
            return "Touch";
        } else {
            return "Talk";
        }
    }

    public override render(): void {
        this.speechBubble.draw();
    }

    public override update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
    }
}
