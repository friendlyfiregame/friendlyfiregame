import { NPC } from './NPC';

export class DummyNPC extends NPC {
    async load(): Promise<void> {
        this.width = 20;
        this.height = 30;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.x - (this.width / 2), -this.y - this.height, this.width, this.height);
        ctx.restore();
    }

    update(dt: number): void {
    }

    enterConversation(): void {
        if (this.hasDialog) {
            console.log("Hi i'm a dummy");
        }
    }

}
