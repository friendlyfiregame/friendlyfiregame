import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity, type EntityArgs } from "../Entity";
import { RenderingLayer } from "../Renderer";
import { NPC } from "./NPC";

@entity("caveman")
export class Caveman extends NPC {
    @asset("sprites/caveman.aseprite.json")
    private static readonly sprite: Aseprite;

    public constructor(args: EntityArgs) {
        super({ width: 18, height: 24, ...args });
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(
            Caveman.sprite,
            "idle",
            this.x, this.y,
            RenderingLayer.ENTITIES,
            this.direction
        );

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        this.speechBubble.draw(ctx);
    }

    public override update(dt: number): void {
        super.update(dt);
        this.speechBubble.update(this.x, this.y);
    }
}
