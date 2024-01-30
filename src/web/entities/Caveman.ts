import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity, type EntityArgs } from "../Entity";
import { RenderingLayer } from "../Renderer";
import { NPC } from "./NPC";

@entity("Caveman")
export class Caveman extends NPC {
    @asset("sprites/caveman.aseprite.json")
    private static readonly sprite: Aseprite;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 18, height: 24 });
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(
            Caveman.sprite,
            "idle",
            this.x, this.y,
            RenderingLayer.ENTITIES,
            this.direction
        );
        this.speechBubble.draw(ctx);
    }

    public override update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
    }
}
