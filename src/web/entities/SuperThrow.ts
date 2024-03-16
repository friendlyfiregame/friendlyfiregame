import conversation from "../../../assets/dialog/superthrow.dialog.json";
import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import { entity, type EntityArgs } from "../Entity";
import { Direction } from "../geom/Direction";
import { RenderingLayer } from "../Renderer";
import { AsepriteNode } from "../scene/AsepriteNode";
import { NPC } from "./NPC";

@entity("SuperThrow")
export class SuperThrow extends NPC {
    @asset("sprites/superthrow.aseprite.json")
    private static readonly sprite: Aseprite;
    private readonly floatAmount = 4;
    private readonly floatSpeed = 2;
    private readonly asepriteNode: AsepriteNode;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 18, height: 22 });
        this.lookAtPlayer = false;
        this.conversation = new Conversation(conversation, this);
        this.asepriteNode = new AsepriteNode({
            aseprite: SuperThrow.sprite,
            tag: "idle",
            layer: RenderingLayer.ENTITIES,
            anchor: Direction.BOTTOM
        }).appendTo(this);
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
        this.asepriteNode.setY(Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount + 1);
        this.speechBubble.update(this.x, this.y);
    }
}
