import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import { entity, type EntityArgs } from "../Entity";
import { EyeType, Face } from "../Face";
import { Direction } from "../geom/Direction";
import { RenderingLayer } from "../Renderer";
import { AsepriteNode } from "../scene/AsepriteNode";
import { NPC } from "./NPC";

@entity("StoneDisciple")
export class StoneDisciple extends NPC {
    @asset("sprites/stonedisciple.aseprite.json")
    private static readonly sprite: Aseprite;
    private readonly asepriteNode: AsepriteNode;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 32, height: 26 });
        this.direction = -1;
        this.lookAtPlayer = true;
        this.face = new Face(this.scene, this, EyeType.STONEDISCIPLE, 0, 0);
       this.asepriteNode = new AsepriteNode({
            aseprite: StoneDisciple.sprite,
            tag: "idle",
            layer: RenderingLayer.ENTITIES,
            anchor: Direction.BOTTOM,
            y: 1
        }).appendTo(this);
     }

    protected override showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        const talkedToStoneDisciple = Conversation.getGlobals()["$talkedToStoneDisciple"];
        const talkedToStoneDiscipleAgain = Conversation.getGlobals()["$talkedToStoneDiscipleAgain"];
        const gotTeleported = Conversation.getGlobals()["$gotTeleported"];

        return (
            talkedToStoneDisciple === undefined
            || (gotTeleported !== undefined && talkedToStoneDiscipleAgain === undefined)
        );
    }

    public override render(): void {
        this.drawFace(false);
        this.speechBubble.draw();
    }

    public override update(dt: number): void {
        super.update(dt);

        if (this.showDialoguePrompt()) {
            this.dialoguePrompt.setY(-this.height).show();
        } else {
            this.dialoguePrompt.hide();
        }
        this.speechBubble.update(this.x, this.y);
        this.asepriteNode.transform(m => m.setScale(this.direction, 1));
    }
}
