import { entity } from "./Entity";
import { Environment } from "./World";
import { now } from "./util";
import { PhysicsEntity } from "./PhysicsEntity";
import { Sound } from "./Sound";
import { Milestone } from "./Player";
import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";

export enum WoodState {
    FREE = 0,
    SWIMMING = 1
}

@entity("wood")
export class Wood extends PhysicsEntity {
    @asset("sprites/wood.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/throwing/success.mp3")
    private static successSound: Sound;

    public state = WoodState.FREE;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 24, 24);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        Wood.sprite.drawTag(ctx, "idle", -Wood.sprite.width >> 1, -Wood.sprite.height, this.scene.gameTime * 1000);
        ctx.restore();
    }

    public isCarried(): boolean {
        return this.scene.player.isCarrying(this);
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
            const player = this.scene.player;
            if (!this.isCarried() && this.distanceTo(player) < 20) {
                player.carry(this);
            }
            if (!this.isCarried() && this.state !== WoodState.SWIMMING
                    && this.scene.world.collidesWith(this.x, this.y - 5) === Environment.WATER) {
                this.state = WoodState.SWIMMING;
                this.setVelocity(0, 0);
                this.setFloating(true);
                this.y = 390;
            }
        }
        if (!this.isCarried() && this.distanceTo(this.scene.fire) < 20) {
            this.scene.fire.feed(this);
            this.scene.player.achieveMilestone(Milestone.THROWN_WOOD_INTO_FIRE);
            Wood.successSound.play();
        }
    }
}
