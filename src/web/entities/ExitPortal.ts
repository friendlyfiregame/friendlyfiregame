import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity, Entity } from "../Entity";
import { GameScene } from "../scenes/GameScene";
import { Sound } from "../audio/Sound";

enum PortalAnimationState { OFF, FADEIN, IDLE }

@entity("exitportal")
export class ExitPortal extends Entity {
    @asset("sprites/portal.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/portal/portal.ogg")
    private static sound: Sound;

    private animationState = PortalAnimationState.OFF;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 32, 50, false);
        this.animator.assignSprite(ExitPortal.sprite);
    }

    public activate (): void {
        if (this.animationState === PortalAnimationState.OFF) {
            ExitPortal.sound.play();
            this.nextAnimationState();
        }
    }

    private nextAnimationState(): void {
        this.animationState++;
    }

    public draw(): void {
        switch (this.animationState) {
            case PortalAnimationState.OFF:
                this.animator.play("empty", 1);
                break;
            case PortalAnimationState.FADEIN:
                this.animator.play("fadein", 1, { loop: false, callback: this.nextAnimationState.bind(this) });
                break;
            case PortalAnimationState.IDLE:
                this.animator.play("idle", 1);
                break;
        }

        if (this.scene.showBounds) {
            this.drawBounds();
        }
    }

    public override update(dt: number): void {
        super.update(dt);
    }
}
