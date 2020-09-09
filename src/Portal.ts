import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { entity, Entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { Sound } from "./Sound";
import { RenderingLayer } from "./RenderingLayer";

enum PortalAnimationState { WAITING, FADEIN, IDLE, FADEOUT, GONE }

@entity("portal")
export class Portal extends Entity {
    @asset("sprites/portal.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/portal/portal.ogg")
    private static sound: Sound;

    private animationState = PortalAnimationState.WAITING;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 32, 50, false);
        this.setLayer(RenderingLayer.ENTITIES);
        this.animator.assignSprite(Portal.sprite);
    }

    private nextAnimationState(): void {
        this.animationState++;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        switch (this.animationState) {
            case PortalAnimationState.WAITING:
                this.animator.play("empty", ctx, 1);
                break;
            case PortalAnimationState.FADEIN:
                this.animator.play("fadein", ctx, 1, { loop: false, callback: this.nextAnimationState.bind(this) });
                break;
            case PortalAnimationState.IDLE:
                this.animator.play("idle", ctx, 1);
                break;
            case PortalAnimationState.FADEOUT:
                this.animator.play("fadeout", ctx, 1, { loop: false, callback: this.nextAnimationState.bind(this) });
                break;
            case PortalAnimationState.GONE:
                this.animator.play("empty", ctx, 1);
                break;
        }
    }

    public update(dt: number): void {
        super.update(dt);

        if (this.animationState === PortalAnimationState.WAITING) {
            if (this.timeAlive >= 1) {
                this.nextAnimationState();
                Portal.sound.play();
            }
        } else if (this.animationState === PortalAnimationState.IDLE) {
            if (this.timeAlive >= 4) {
                this.nextAnimationState();
            }
        } else if (this.animationState === PortalAnimationState.GONE) {
            this.gameScene.removeGameObject(this);
        }
    }
}
