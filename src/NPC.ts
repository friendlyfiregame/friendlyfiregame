import { Face } from './Face';
import { ScriptedDialog } from './ScriptedDialog';
import { PhysicsEntity } from "./PhysicsEntity";
import { SpeechBubble } from './SpeechBubble';
import { Conversation } from './Conversation';

export abstract class NPC extends PhysicsEntity {
    public face: Face | null = null;
    public scriptedDialog: ScriptedDialog | null = null;
    public conversation: Conversation | null = null;
    public speechBubble = new SpeechBubble(this.x, this.y, "white");

    public get hasDialog(): boolean {
        return this.scriptedDialog?.hasPlayerDialog ?? false;
    }

    protected drawFace(ctx: CanvasRenderingContext2D): void {
        if (this.face) {
            this.face.draw(ctx);
        }
    }

    protected drawDialog(ctx: CanvasRenderingContext2D): void {
        this.scriptedDialog?.draw(ctx);
    }

    protected updateDialog(dt: number) {
        this.scriptedDialog?.update(dt);
    }
}
