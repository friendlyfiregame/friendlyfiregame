import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { Conversation } from "./Conversation";
import { entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import powershiba1 from "../assets/dialog/powershiba1.dialog.json";
import powershiba3 from "../assets/dialog/powershiba3.dialog.json";
import { RenderingLayer } from "./Renderer";

export enum PowerShibaState {
    IN_CLOUDS,
    ON_MOUNTAIN,
    CONSUMED
}

@entity("powershiba")
export class PowerShiba extends NPC {
    @asset("sprites/powershiba.aseprite.json")
    private static sprite: Aseprite;
    private state = PowerShibaState.IN_CLOUDS;

    private floatAmount = 4;
    private floatSpeed = 2;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 22, 22);
        this.setLayer(RenderingLayer.ENTITIES);
        this.conversation = new Conversation(powershiba1, this);
    }

    public nextState(): void {
        this.state++;

        if (this.state === PowerShibaState.ON_MOUNTAIN) {
            const spawn = this.scene.pointsOfInterest.find(poi => poi.name === "powershiba_mountain_spawn");

            if (!spawn) throw new Error("PowerShiba mountain spawn missing");

            this.floatSpeed = 2;
            this.floatAmount = 4;
            this.x = spawn.x;
            this.y = spawn.y;
            this.conversation = new Conversation(powershiba3, this);
        }
    }

    protected showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) return false;
        else if (Conversation.getGlobals()["$gaveBoneToPowerShiba"] && !Conversation.getGlobals()["$seedgrown"]) return true;
        else if (Conversation.getGlobals()["$gaveBoneToPowerShiba"] && Conversation.getGlobals()["$seedgrown"] && !Conversation.getGlobals()["$gotPowerShibaQuest"]) return true;
        else if (this.state === PowerShibaState.ON_MOUNTAIN) return true;
        return false;
    }


    public feed(): void {
        this.floatSpeed = 3;
        this.floatAmount = 5;
        this.scene.game.campaign.runAction("giveBone");
        this.think("Oh… I remember…", 3000);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;

        this.scene.renderer.drawAseprite(
            ctx,
            PowerShiba.sprite, "idle", 0, -floatOffsetY,
            1
        );

        if (this.thinkBubble) {
            this.thinkBubble.draw(ctx);
        }

        this.speechBubble.draw(ctx);
    }

    public update(dt: number): void {
        super.update(dt);
        this.dialoguePrompt.updatePosition(0, 16);
    }
}
