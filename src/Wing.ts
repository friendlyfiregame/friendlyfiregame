import { entity } from "./Entity";
import { Game } from "./game";
import { NPC } from './NPC';
import { Aseprite } from './Aseprite';

@entity("wing")
export class Wing extends NPC {
    private sprite!: Aseprite;
    private timeAlive = 0;

    private floatAmount = 4;
    private floatSpeed = 2;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 24, 24);
    }

    public async load(): Promise<void> {
        this.sprite = await Aseprite.load("assets/sprites/wing.aseprite.json");
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;
        ctx.translate(this.x, -this.y - floatOffsetY);
        this.sprite.drawTag(ctx, "idle", -this.sprite.width >> 1, -this.sprite.height);
        ctx.restore();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.timeAlive += dt;
        this.speechBubble.update(this.x, this.y);
    }
}
