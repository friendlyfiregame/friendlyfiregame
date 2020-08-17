import { GameScene } from './scenes/GameScene';
import { PhysicsEntity } from './PhysicsEntity';
import { PIXEL_PER_METER } from './constants';
import { Point, Size } from './Geometry';

export class Snowball extends PhysicsEntity {
    public constructor(scene: GameScene, position: Point, velocityX: number, velocityY: number) {
        super(scene, position, new Size(0.25 * PIXEL_PER_METER, 0.25 * PIXEL_PER_METER));
        this.setVelocity(velocityX, velocityY);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.position.x, -this.position.y);
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(0, -this.size.height / 2, this.size.width / 2, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}
