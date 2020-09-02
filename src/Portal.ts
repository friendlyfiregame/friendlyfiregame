import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { entity, Entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { Sound } from "./Sound";

enum PortalAnimationState { WAITING, FADEIN, IDLE, FADEOUT, GONE }

@entity("portal")
export class Portal extends Entity {
    @asset("sprites/portal.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/portal/portal.ogg")
    private static sound: Sound;

    private animationState = PortalAnimationState.WAITING;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 32, 50, false);
        this.animator.assignSprite(Portal.sprite);
    }

    private nextAnimationState(): void {
        this.animationState++;
    }

    public draw(): void {
        switch (this.animationState) {
            case PortalAnimationState.WAITING:
                this.animator.play("empty", 1);
                break;
            case PortalAnimationState.FADEIN:
                this.animator.play("fadein", 1, { loop: false, callback: this.nextAnimationState.bind(this) });
                break;
            case PortalAnimationState.IDLE:
                this.animator.play("idle", 1);
                break;
            case PortalAnimationState.FADEOUT:
                this.animator.play("fadeout", 1, { loop: false, callback: this.nextAnimationState.bind(this) });
                break;
            case PortalAnimationState.GONE:
                this.animator.play("empty", 1);
                break;
        }

        if (this.scene.showBounds) {
            this.drawBounds();
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
            this.scene.removeGameObject(this);
        }
    }
}
