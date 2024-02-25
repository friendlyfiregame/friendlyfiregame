import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity, type EntityArgs } from "../Entity";
import { Direction } from "../geom/Direction";
import { RenderingLayer } from "../Renderer";
import { AsepriteNode } from "../scene/AsepriteNode";
import { PhysicsEntity } from "./PhysicsEntity";

@entity("Skull")
export class Skull extends PhysicsEntity {
    @asset("sprites/skull.aseprite.json")
    private static readonly sprite: Aseprite;

    public constructor(args: EntityArgs) {
        super({
            ...args,
            width: Skull.sprite.width,
            height: Skull.sprite.height,
            reversed: true
        });
        this.appendChild(new AsepriteNode({
            aseprite: Skull.sprite,
            layer: RenderingLayer.ENTITIES,
            anchor: Direction.BOTTOM,
            y: 1
        }));
    }

    public isCarried(): boolean {
        return this.scene.player.isCarrying(this);
    }

    protected override isPhysicsEnabled(): boolean {
        return !this.isCarried();
    }

    public override update(dt: number): void {
        super.update(dt);

        const player = this.scene.player;

        if (!this.isCarried() && this.distanceTo(player) < 20) {
            player.carry(this);
        }
    }
}
