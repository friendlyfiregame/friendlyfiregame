import { entity } from "./Entity";
import { NPC } from './NPC';
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { RenderingLayer } from './Renderer';
import { Conversation } from './Conversation';
import powershiba1 from '../assets/dialog/powershiba1.dialog.json';
import powershiba2 from '../assets/dialog/powershiba2.dialog.json';
import powershiba3 from '../assets/dialog/powershiba3.dialog.json';

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

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 22, 22);
        this.conversation = new Conversation(powershiba1, this);
    }

    public nextState (): void {
        this.state++;

        if (this.state === PowerShibaState.ON_MOUNTAIN) {
            const spawn = this.scene.pointsOfInterest.find(poi => poi.name === "powershiba_mountain_spawn");
            if (!spawn) throw new Error('PowerShiba mountain spawn missing');
            this.floatSpeed = 2;
            this.floatAmount = 4;
            this.x = spawn.x;
            this.y = spawn.y;
            this.conversation = new Conversation(powershiba3, this);
        }
    }

    protected showDialoguePrompt (): boolean {
        if (!super.showDialoguePrompt()) return false;
        return false;
    }


    public feed(): void {
        this.floatSpeed = 3;
        this.floatAmount = 5;
        this.conversation = new Conversation(powershiba2, this);
        Conversation.setGlobal('gaveBoneToPowerShiba', 'true');
        this.think('thx', 3000);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;
        this.scene.renderer.addAseprite(PowerShiba.sprite, "idle", this.x, this.y - floatOffsetY, RenderingLayer.ENTITIES);
        if (this.scene.showBounds) this.drawBounds();
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        if (this.thinkBubble) {
            this.thinkBubble.draw(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.dialoguePrompt.update(dt, this.x, this.y + 16);
        this.speechBubble.update(this.x, this.y);
        if (this.thinkBubble) {
            this.thinkBubble.update(this.x, this.y);
        }
    }
}
