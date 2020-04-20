import { entity } from "./Entity";
import { Game } from "./game";
import { Sprites, getSpriteIndex } from "./Sprites";
import { loadImage } from "./graphics";
import { WING_ANIMATION } from "./constants";
import { Greeting } from './Greeting';
import dialogData from "../assets/flameboy.texts.json";
import { NPC } from './NPC';

@entity("wing")
export class Wing extends NPC {
    private sprites!: Sprites;
    private spriteIndex = 0;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 24, 24);
    }

    public async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/powerup_wing.png"), 4, 1);
        this.greeting = new Greeting(this.game, this, dialogData);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);
        this.sprites.draw(ctx, this.spriteIndex);
        ctx.restore();
        this.drawGreeting(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.spriteIndex = getSpriteIndex(0, WING_ANIMATION);
        this.updateGreeting(dt);
    }
}
