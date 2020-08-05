import { entity } from "./Entity";
import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { MAX_PLAYER_SPEED } from "./constants";
import conversation from '../assets/dialog/bird.dialog.json';
import { Conversation } from './Conversation';
import { RenderingLayer } from './Renderer';
import { ScriptableNPC } from './ScriptableNPC';
import shiba1 from '../assets/dialog/shiba1.dialog.json';
import shiba2 from '../assets/dialog/shiba2.dialog.json';

@entity("shiba")
export class Shiba extends ScriptableNPC {
    @asset("sprites/shiba.aseprite.json")
    private static sprite: Aseprite;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 28, 24);
        this.conversation = new Conversation(conversation, this);
        this.setMaxVelocity(MAX_PLAYER_SPEED);
        this.conversation = new Conversation(shiba1, this);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(Shiba.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES, this.direction)
        if (this.scene.showBounds) this.drawBounds();
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        if (this.thinkBubble) {
            this.thinkBubble.draw(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    public showDialoguePrompt (): boolean {
        if (!super.showDialoguePrompt()) return false;
        if (Conversation.getGlobals()['$broughtBone'] && !Conversation.getGlobals()['$talkedToShibaWithBone']) return true;
        return false;
    }

    update(dt: number): void {
        super.update(dt);
        this.dialoguePrompt.update(dt, this.x, this.y + 20);
        this.speechBubble.update(this.x, this.y);
        if (this.thinkBubble) {
            this.thinkBubble.update(this.x, this.y);
        }

        // Check if Bone is near
        if (!Conversation.getGlobals()['$broughtBone'] && this.distanceTo(this.scene.bone) < 100) {
            Conversation.setGlobal('broughtBone', 'true');
            this.think('Wow! Bone!', 3000);
            this.conversation = new Conversation(shiba2, this);
        }
    }
}
