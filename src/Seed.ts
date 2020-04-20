import { entity } from "./Entity";
import { Game } from "./game";
import { Sprites } from "./Sprites";
import { loadImage } from "./graphics";
import { Face, EyeType } from './Face';
import { NPC } from './NPC';
import { Environment } from "./World";

export enum SeedState {
    FREE = 0,
    PLANTED = 1
}

@entity("seed")
export class Seed extends NPC {
    private sprites!: Sprites;
    private spriteIndex = 0;
    public state = SeedState.FREE;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 24, 24);
        this.face = new Face(this, EyeType.STANDARD, 1, -4, 8);
    }

    public async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/seed.png"), 2, 1);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        this.sprites.draw(ctx, this.spriteIndex);
        ctx.restore();
        if (this.state === SeedState.PLANTED) {
            this.drawFace(ctx);
        }
    }

    public isCarried(): boolean {
        return this.game.player.isCarrying(this);
    }

    update(dt: number): void {
        super.update(dt);
        if (this.state === SeedState.FREE) {
            this.spriteIndex = 0;
            const player = this.game.player;
            if (!this.isCarried() && this.distanceTo(player) < 10) {
                player.carry(this);
            }
            if (!this.isCarried() && this.game.world.collidesWith(this.x, this.y - 8) === Environment.SOIL) {
                this.state = SeedState.PLANTED;
                this.setFloating(true);
                this.x = 2052;
                this.y = 1624;
                this.spriteIndex = 1;
            }
        } else if (this.state === SeedState.PLANTED) {
        }
    }

    startDialog(): void {
    }
}
