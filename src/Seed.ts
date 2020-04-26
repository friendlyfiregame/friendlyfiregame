import { entity } from "./Entity";
import { Game } from "./game";
import { Sprites } from "./Sprites";
import { loadImage } from "./graphics";
import { Face, EyeType } from './Face';
import { NPC } from './NPC';
import { Environment } from "./World";
import { now } from "./util";
import { Sound } from './Sound';
import { Wood } from "./Wood";
import { Milestone } from "./Player";

export enum SeedState {
    FREE = 0,
    PLANTED = 1,
    SWIMMING = 2,
    GROWN = 3
}

@entity("seed")
export class Seed extends NPC {
    private sprites!: Sprites;
    private spriteIndex = 0;
    public state = SeedState.FREE;
    private successSound!: Sound;
    private wood: Wood;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 24, 24);
        this.wood = new Wood(game, x, y);
        this.face = new Face(this, EyeType.STANDARD, 1, 0, 8);
    }

    public async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/seed.png"), 3, 1);
        this.successSound = new Sound("sounds/throwing/success.mp3");
        await this.wood.load();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        this.sprites.draw(ctx, this.spriteIndex);
        ctx.restore();
        if (this.state === SeedState.GROWN) {
            this.drawFace(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    public isCarried(): boolean {
        return this.game.player.isCarrying(this);
    }

    public grow(): void {
        if (this.state === SeedState.PLANTED) {
            this.state = SeedState.GROWN;
            this.spriteIndex = 2;
            this.game.seed = this;
            this.game.campaign.runAction("enable", null, ["tree", "tree2"]);
            this.game.campaign.runAction("enable", null, ["seed", "seed1"]);
        }
    }

    update(dt: number): void {
        super.update(dt);
        if (this.state === SeedState.SWIMMING) {
            const diffX = 1035 - this.x;
            const moveX = Math.min(20, Math.abs(diffX)) * Math.sign(diffX);
            this.x += moveX * dt;
            this.setVelocityY(Math.abs(((now() % 2000) - 1000) / 1000) - 0.5);
        }
        if (this.state === SeedState.FREE || this.state === SeedState.SWIMMING) {
            this.spriteIndex = 0;
            const player = this.game.player;
            if (!this.isCarried() && this.distanceTo(player) < 20) {
                player.carry(this);
            }
            if (!this.isCarried() && this.game.world.collidesWith(this.x, this.y - 8) === Environment.SOIL) {
                this.state = SeedState.PLANTED;
                this.game.player.achieveMilestone(Milestone.PLANTED_SEED);
                this.setFloating(true);
                this.x = 2052;
                this.y = 1624;
                this.spriteIndex = 1;
                this.successSound.play();
                this.game.campaign.runAction("enable", null, ["stone", "stone2"]);
            }
            if (!this.isCarried() && this.state !== SeedState.SWIMMING && this.game.world.collidesWith(this.x, this.y - 5) === Environment.WATER) {
                this.state = SeedState.SWIMMING;
                this.setVelocity(0, 0);
                this.setFloating(true);
                this.y = 390;
            }
        } else if (this.state === SeedState.PLANTED) {
            if (this.game.world.isRaining()) {
                this.grow();
            }
        } else if (this.state === SeedState.GROWN) {
            // TODO Special update behavior when grown
        }
        this.speechBubble.update(this.x, this.y);
    }

    public spawnWood(): Wood {
        if (!this.game.gameObjects.includes(this.wood)) {
            this.game.addGameObject(this.wood);
        }
        this.wood.x = this.x;
        this.wood.y = this.y + this.height / 2;
        this.wood.setVelocity(-5, 0);
        return this.wood;
    }

    startDialog(): void {
    }
}
