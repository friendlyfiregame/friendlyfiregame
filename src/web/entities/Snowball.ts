import { PIXEL_PER_METER } from "../../shared/constants";
import { entity } from "../Entity";
import { RenderingLayer, RenderingType } from "../Renderer";
import { PhysicsEntity, type PhysicsEntityArgs } from "./PhysicsEntity";

@entity("snowball")
export class Snowball extends PhysicsEntity {
    public constructor(args: PhysicsEntityArgs) {
        super({ width: 0.25 * PIXEL_PER_METER, height: 0.25 * PIXEL_PER_METER, ...args });
    }

    public draw(): void {
        this.scene.renderer.add({
            type: RenderingType.RAW,
            layer: RenderingLayer.ENTITIES,
            draw: (ctx: CanvasRenderingContext2D) => {
                ctx.save();
                ctx.beginPath();
                ctx.translate(this.x, -this.y);
                ctx.strokeStyle = "black";
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(0, -this.height / 2, this.width / 2, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        });

        if (this.scene.showBounds) this.drawBounds();
    }
}
