import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity, entity, type EntityArgs } from "../Entity";
import { Direction } from "../geom/Direction";
import { RenderingLayer } from "../Renderer";
import { AsepriteNode } from "../scene/AsepriteNode";
import { type CollidableGameObject } from "../scenes/GameObject";
import { Environment } from "../World";

enum WallState { SOLID, CRUMBLED }

export interface WallArgs extends EntityArgs {
    identifier?: string;
}

@entity("Wall")
export class Wall extends Entity implements CollidableGameObject {
    @asset("sprites/wall.aseprite.json")
    private static readonly sprite: Aseprite;
    public readonly identifier: string;
    private state = WallState.SOLID;
    private readonly asepriteNode: AsepriteNode;

    public constructor({ identifier, ...args }: WallArgs) {
        super({ ...args, width: 24, height: 72, isTrigger: false, reversed: true });
        if (identifier == null) {
            throw new Error("Cannot create Wall entity with no identifier property");
        }
        this.identifier = identifier;
        this.asepriteNode = new AsepriteNode({
            aseprite: Wall.sprite,
            tag: "solid",
            layer: RenderingLayer.ENTITIES,
            anchor: Direction.BOTTOM,
            y: 1
        }).appendTo(this);
    }

    public override update(): void {}

    public crumble(): void {
        this.state = WallState.CRUMBLED;
        this.asepriteNode.setTag("crumbled");
    }

    public collidesWith(x: number, y: number): number {
        if (
            this.state === WallState.SOLID
            && x >= this.x - this.width / 2
            && x <= this.x + this.width / 2
            && y >= this.y - this.height
            && y <= this.y
        ) {
            return Environment.SOLID;
        }

        return Environment.AIR;
    }
}
