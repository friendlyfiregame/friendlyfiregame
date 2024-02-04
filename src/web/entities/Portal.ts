import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { type Sound } from "../audio/Sound";
import { Entity, entity, type EntityArgs } from "../Entity";

enum PortalAnimationState { WAITING, FADEIN, IDLE, FADEOUT, GONE }

@entity("Portal")
export class Portal extends Entity {
    @asset("sprites/portal.aseprite.json")
    private static readonly sprite: Aseprite;

    @asset("sounds/portal/portal.ogg")
    private static readonly sound: Sound;

    private animationState = PortalAnimationState.WAITING;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 32, height: 50, isTrigger: false, reversed: true });
        this.animator.assignSprite(Portal.sprite);
    }

    private nextAnimationState(): void {
        this.animationState++;
    }

    public override render(): void {
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
    }

    public override update(dt: number): void {
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
