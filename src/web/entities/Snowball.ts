import { GameScene } from "../scenes/GameScene";
import { PhysicsEntity } from "./PhysicsEntity";
import { PIXEL_PER_METER } from "../../shared/constants";
import { RenderingLayer, RenderingType } from "../Renderer";

export class Snowball extends PhysicsEntity {
    public constructor(scene: GameScene, x: number, y: number, velocityX: number, velocityY: number) {
        super(scene, x, y, 0.25 * PIXEL_PER_METER, 0.25 * PIXEL_PER_METER);

        this.setVelocity(velocityX, velocityY);
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
