import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity, type EntityArgs } from "../Entity";
import { RenderingLayer } from "../Renderer";
import { PhysicsEntity } from "./PhysicsEntity";

@entity("skull")
export class Skull extends PhysicsEntity {
    @asset("sprites/skull.aseprite.json")
    private static readonly sprite: Aseprite;

    public constructor(args: EntityArgs) {
        super({ width: 16, height: 16, ...args });
    }

    public draw(): void {
        this.scene.renderer.addAseprite(Skull.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES);
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
    }
}
