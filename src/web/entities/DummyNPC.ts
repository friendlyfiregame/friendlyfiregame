import { asset } from "../Assets";
import { BitmapFont } from "../BitmapFont";
import { DIALOG_FONT } from "../../shared/constants";
import dialogData from "../../assets/dummy.texts.json";
import { entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import { Greeting } from "../Greeting";
import { NPC } from "./NPC";

@entity("tree")
export class DummyNPC extends NPC {
    @asset(DIALOG_FONT)
    private static readonly font: BitmapFont;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 20, 30);
        this.greeting = new Greeting(this.scene, this, dialogData);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        DummyNPC.font.drawText(
            ctx,
            "NPC",
            this.x, -this.y - this.height - 10,
            "black",
            0.5
        );

        ctx.strokeStyle = "black";

        ctx.strokeRect(
            this.x - Math.round(this.width / 2) - 0.5, -this.y - this.height - 0.5,
            this.width, this.height
        );

        ctx.restore();
        this.drawDialoguePrompt();
        this.drawGreeting(ctx);
    }

    public override update(dt: number): void {
        this.updateGreeting();
    }
}
