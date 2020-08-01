import { entity, Entity } from "./Entity";
import { Aseprite } from './Aseprite';
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { Sound } from './Sound';

enum PortalAnimationState { WAITING, FADEIN, IDLE, FADEOUT, GONE }

@entity("portal")
export class Portal extends Entity {
    @asset("sprites/portal.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/portal/portal.ogg")
    private static sound: Sound;

    private animationState = PortalAnimationState.WAITING;
    private maxAge = 10;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 32, 50, false);
        this.animator.assignSprite(Portal.sprite);
    }

    private nextAnimationState (): void {
        this.animationState++;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);

        switch (this.animationState) {
            case PortalAnimationState.WAITING: this.animator.play("empty", ctx); break;
            case PortalAnimationState.FADEIN: this.animator.play("fadein", ctx, { playUntilFinished: true }); break;
            case PortalAnimationState.IDLE: this.animator.play("idle", ctx); break;
            case PortalAnimationState.FADEOUT: this.animator.play("fadeout", ctx, { playUntilFinished: true }); break;
            case PortalAnimationState.GONE: this.animator.play("empty", ctx); break;
        }

        ctx.restore();
        if (this.scene.showBounds) this.drawBounds();
    }

    update(dt: number): void {
        super.update(dt);
        if (this.timeAlive >= this.maxAge) {
            this.scene.removeGameObject(this);
        }

        if (this.animationState === PortalAnimationState.WAITING) {
            if (this.timeAlive >= 1) {
                this.nextAnimationState();
                Portal.sound.play();
            }
        } else if (this.animationState === PortalAnimationState.FADEIN) {
            this.nextAnimationState();
        } else if (this.animationState === PortalAnimationState.IDLE) {
            if (this.timeAlive >= 4) {
                this.nextAnimationState();
            }
        } else if (this.animationState === PortalAnimationState.FADEOUT) {
            this.nextAnimationState();
        }
    }
}
