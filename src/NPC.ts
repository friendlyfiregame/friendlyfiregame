import { Entity } from './Entity';
import { Face } from './Face';

export abstract class NPC extends Entity {
    public hasDialog = false;
    public face: Face | null = null;

    abstract startDialog(): void;

    protected drawFace(ctx: CanvasRenderingContext2D): void {
        if (this.face) {
            this.face.draw(ctx);
        }
    }
}
