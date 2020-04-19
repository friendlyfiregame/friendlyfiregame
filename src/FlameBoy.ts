import { entity } from "./Entity";
import { Game } from "./game";
import { Sprites, getSpriteIndex } from "./Sprites";
import { loadImage } from "./graphics";
import { FLAMEBOY_ANIMATION } from "./constants";
import { PhysicsEntity } from "./PhysicsEntity";

@entity("flameboy")
export class FlameBoy extends PhysicsEntity {
    private sprites!: Sprites;
    private spriteIndex = 0;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 26, 54);
    }

    public async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/flameboy.png"), 6, 1);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        this.sprites.draw(ctx, this.spriteIndex);
        ctx.restore();
    }

    update(dt: number): void {
        this.spriteIndex = getSpriteIndex(0, FLAMEBOY_ANIMATION);
    }
}