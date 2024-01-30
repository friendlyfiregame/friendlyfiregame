import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Entity, entity, type EntityArgs } from "../Entity";
import { RenderingLayer } from "../Renderer";
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

    public constructor({ identifier, ...args }: WallArgs) {
        super({ ...args, width: 24, height: 72, isTrigger: false });

        if (identifier == null) {
            throw new Error("Cannot create Wall entity with no identifier property");
        }

        this.identifier = identifier;
    }

    public override draw(): void {
        const animationTag = this.state === WallState.SOLID ? "solid" : "crumbled";
        this.scene.renderer.addAseprite(Wall.sprite, animationTag, this.x, this.y, RenderingLayer.ENTITIES);
    }

    public override update(): void {}

    public crumble(): void {
        this.state = WallState.CRUMBLED;
    }

    public collidesWith(x: number, y: number): number {
        if (
            this.state === WallState.SOLID
            && x >= this.x - this.width / 2
            && x <= this.x + this.width / 2
            && y >= this.y
            && y <= this.y + this.height
        ) {
            return Environment.SOLID;
        }

        return Environment.AIR;
    }
}
