import { NPC } from './NPC';
import { entity } from "./Entity";
import { Game } from "./game";
import { ScriptedDialog } from './ScriptedDialog';
import dialogData from "../assets/dummy.texts.json";

@entity("tree")
export class DummyNPC extends NPC {
    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 20, 30);
    }

    async load(): Promise<void> {
        this.scriptedDialog = new ScriptedDialog(this.game, this, dialogData);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        this.game.mainFont.drawText(ctx, "NPC", this.x, -this.y - this.height - 10, "black", 0.5);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.x - Math.round(this.width / 2) - 0.5, -this.y - this.height - 0.5, this.width, this.height);
        ctx.restore();
        this.drawDialog(ctx);
    }

    update(dt: number): void {
        this.updateDialog(dt);
    }

}
