import { NPC } from './NPC';

export class DummyNPC extends NPC {
    private infoTextRange = 50;
    private infoTextActive = false;
    private infoTextDistance = 15;

    async load(): Promise<void> {
        this.width = 20;
        this.height = 30;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.strokeText("NPC", this.x - (this.width / 2), -this.y - this.height);
        ctx.strokeRect(this.x - (this.width / 2), -this.y - this.height, this.width, this.height);
        ctx.restore();
        if (this.infoTextActive) {
            this.drawInfoText(ctx);
        }
    }

    drawInfoText(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.strokeText("Hi", this.x - (this.width / 2), -this.y - (this.height + this.infoTextDistance));
        ctx.strokeRect(this.x - (this.width / 2), -this.y - this.height - this.infoTextDistance - 15, this.width, 20);
        ctx.restore();
    }

    update(dt: number): void {
        this.infoTextActive = this.game.player.distanceTo(this) < this.infoTextRange;
    }

    enterConversation(): void {
        if (this.hasDialog) {
            console.log("Hi i'm a dummy");
        }
    }

}
