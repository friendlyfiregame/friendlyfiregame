import { entity } from "./Entity";
import { Game } from "./game";
import { Sprites, getSpriteIndex } from "./Sprites";
import { loadImage } from "./graphics";
import { WING_ANIMATION } from "./constants";
import { NPC } from './NPC';

@entity("wing")
export class Wing extends NPC {
    private sprites!: Sprites;
    private spriteIndex = 0;
    private timeAlive = 0;

    private flaotAmount = 4;
    private floatSpeed = 2;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 24, 24);
    }

    public async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/powerup_wing.png"), 4, 1);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.flaotAmount;
        ctx.translate(this.x, -this.y - floatOffsetY);
        this.sprites.draw(ctx, this.spriteIndex);
        ctx.restore();
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.timeAlive += dt;
        this.spriteIndex = getSpriteIndex(0, WING_ANIMATION);
        this.speechBubble.update(this.x, this.y);
    }
}
