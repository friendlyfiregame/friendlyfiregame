import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Sound } from "../audio/Sound";
import { Entity, entity, type EntityArgs } from "../Entity";

enum PortalAnimationState { OFF, FADEIN, IDLE }

@entity("exitportal")
export class ExitPortal extends Entity {
    @asset("sprites/portal.aseprite.json")
    private static readonly sprite: Aseprite;

    @asset("sounds/portal/portal.ogg")
    private static readonly sound: Sound;

    private animationState = PortalAnimationState.OFF;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 32, height: 50, isTrigger: false });
        this.animator.assignSprite(ExitPortal.sprite);
    }

    public activate(): void {
        if (this.animationState === PortalAnimationState.OFF) {
            ExitPortal.sound.play();
            this.nextAnimationState();
        }
    }

    private nextAnimationState(): void {
        this.animationState++;
    }

    public override draw(): void {
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
    }

    public override update(dt: number): void {
        super.update(dt);
    }
}
