import { entity } from "./Entity";
import { Game } from "./game";
import { Sprites } from "./Sprites";
import { loadImage } from "./graphics";
import { Environment } from "./World";
import { now } from "./util";
import { PhysicsEntity } from "./PhysicsEntity";
import { Sound } from "./Sound";
import { Milestone } from "./Player";

export enum WoodState {
    FREE = 0,
    SWIMMING = 1
}

@entity("wood")
export class Wood extends PhysicsEntity {
    private sprites!: Sprites;
    public state = WoodState.FREE;
    private successSound!: Sound;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 24, 24);
    }

    public async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/wood.png"), 1, 1);
        this.successSound = new Sound("sounds/throwing/success.mp3");
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        this.sprites.draw(ctx, 0);
        ctx.restore();
    }

    public isCarried(): boolean {
        return this.game.player.isCarrying(this);
    }

    update(dt: number): void {
        super.update(dt);
        if (this.state === WoodState.SWIMMING) {
            const diffX = 1035 - this.x;
            const moveX = Math.min(20, Math.abs(diffX)) * Math.sign(diffX);
            this.x += moveX * dt;
            this.setVelocityY(Math.abs(((now() % 2000) - 1000) / 1000) - 0.5);
        }
        if (this.state === WoodState.FREE || this.state === WoodState.SWIMMING) {
            const player = this.game.player;
            if (!this.isCarried() && this.distanceTo(player) < 20) {
                player.carry(this);
            }
            if (!this.isCarried() && this.state !== WoodState.SWIMMING
                    && this.game.world.collidesWith(this.x, this.y - 5) === Environment.WATER) {
                this.state = WoodState.SWIMMING;
                this.setVelocity(0, 0);
                this.setFloating(true);
                this.y = 390;
            }
        }
        if (!this.isCarried() && this.distanceTo(this.game.fire) < 20) {
            this.game.fire.feed(this);
            this.game.player.achieveMilestone(Milestone.THROWN_WOOD_INTO_FIRE);
            this.successSound.play();
        }
    }
}
