import { Entity } from './Entity';
import { Face } from './Face';
import { ScriptedDialog } from './ScriptedDialog';

export abstract class NPC extends Entity {
    public hasDialog = false;
    public face: Face | null = null;
    public scriptedDialog: ScriptedDialog | null = null;

    abstract startDialog(): void;

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
