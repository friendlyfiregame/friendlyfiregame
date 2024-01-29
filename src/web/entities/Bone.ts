import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Sound } from "../audio/Sound";
import { Conversation } from "../Conversation";
import { entity, type EntityArgs } from "../Entity";
import { RenderingLayer } from "../Renderer";
import { Environment } from "../World";
import { PhysicsEntity } from "./PhysicsEntity";

@entity("bone")
export class Bone extends PhysicsEntity {
    @asset("sprites/bone.aseprite.json")
    private static readonly sprite: Aseprite;

    @asset("sounds/throwing/success.mp3")
    private static readonly successSound: Sound;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 20, height: 10 });
    }

    public override draw(): void {
        this.scene.renderer.addAseprite(Bone.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES);
    }

    public isCarried(): boolean {
        return this.scene.player.isCarrying(this);
    }

    public override update(dt: number): void {
        super.update(dt);

        const player = this.scene.player;

        if (!this.isCarried() && this.distanceTo(player) < 20) {
            player.carry(this);
        }

        if (!this.isCarried() && this.scene.world.collidesWith(this.x, this.y - 5) === Environment.WATER) {
            const vx = this.getVelocityX();
            this.setVelocity(vx, 10);
        }

        if (Conversation.getGlobals()["$gotBoneQuest"] && !this.isCarried() && this.distanceTo(this.scene.powerShiba) < 20) {
            Bone.successSound.play();
            this.scene.powerShiba.feed();
            this.scene.removeGameObject(this);
        }
    }
}
