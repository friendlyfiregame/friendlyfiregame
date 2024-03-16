import powershiba1 from "../../../assets/dialog/powershiba1.dialog.json";
import powershiba3 from "../../../assets/dialog/powershiba3.dialog.json";
import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import { entity, type EntityArgs } from "../Entity";
import { Direction } from "../geom/Direction";
import { RenderingLayer } from "../Renderer";
import { AsepriteNode } from "../scene/AsepriteNode";
import { NPC } from "./NPC";
import { Pointer } from "./Pointer";

export enum PowerShibaState {
    IN_CLOUDS,
    ON_MOUNTAIN,
    CONSUMED
}

@entity("PowerShiba")
export class PowerShiba extends NPC {
    @asset("sprites/powershiba.aseprite.json")
    private static readonly sprite: Aseprite;
    private state = PowerShibaState.IN_CLOUDS;
    private readonly asepriteNode: AsepriteNode;

    private floatAmount = 4;
    private floatSpeed = 2;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 22, height: 22 });
        this.conversation = new Conversation(powershiba1, this);
        this.asepriteNode = new AsepriteNode({
            aseprite: PowerShiba.sprite,
            tag: "idle",
            layer: RenderingLayer.ENTITIES,
            anchor: Direction.BOTTOM
        }).appendTo(this);
    }

    public nextState(): void {
        this.state++;

        if (this.state === PowerShibaState.ON_MOUNTAIN) {
            const spawn = this.scene.findEntity(Pointer, "powershiba_mountain_spawn");

            if (!spawn) throw new Error("PowerShiba mountain spawn missing");

            this.floatSpeed = 2;
            this.floatAmount = 4;
            this.x = spawn.x;
            this.y = spawn.y;
            this.conversation = new Conversation(powershiba3, this);
        }
    }

    protected override showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) return false;
        else if (Conversation.getGlobals()["$gaveBoneToPowerShiba"] && !Conversation.getGlobals()["$seedgrown"]) return true;
        else if (Conversation.getGlobals()["$gaveBoneToPowerShiba"] && Conversation.getGlobals()["$seedgrown"]
            && !Conversation.getGlobals()["$gotPowerShibaQuest"]) return true;
        else if (this.state === PowerShibaState.ON_MOUNTAIN) return true;
        return false;
    }


    public feed(): void {
        this.floatSpeed = 3;
        this.floatAmount = 5;
        this.scene.game.campaign.runAction("giveBone");
        void this.think("Oh… I remember…", 3000);
    }

    public override render(): void {
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        if (this.thinkBubble) {
            this.thinkBubble.draw();
        }

        this.speechBubble.draw();
    }

    public override update(dt: number): void {
        super.update(dt);
        this.asepriteNode.setY(Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount + 1);
        this.dialoguePrompt.update(dt, this.x, this.y - 16);
        this.speechBubble.update(this.x, this.y);

        if (this.thinkBubble) {
            this.thinkBubble.update(this.x, this.y);
        }
    }
}
