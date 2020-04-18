import { Entity } from './Entity';
import { Game } from "./game";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): CanvasRenderingContext2D {
    if (w < 2 * r) {r = w / 2};
    if (h < 2 * r) {r = h / 2};
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    return ctx;
  }

export class SpeechBubble extends Entity {
    public fontSize = 10;
    public lineHeight = 15;
    public height = this.message.split("\n").length * this.lineHeight;

    constructor(
        game: Game,
        x: number,
        y: number,
        private color = "#FFBBBB",
        public interactive = true,
        public message = "Ey du Block,\nhast du 1 nicen Auftrag für me?"
    ) {
        super(game, x, y);
    }

    draw(ctx: CanvasRenderingContext2D, x?: number, y?: number): void {
        x = x ?? this.x;
        y = (y ?? this.y) + 10;
        ctx.save();
        ctx.beginPath();
        ctx.font = this.fontSize + "px Arial";
        const calculatedWidth = ctx.measureText(this.message.split("\n").sort((a, b) => b.length - a.length)[0]).width;
        console.log(calculatedWidth)
        ctx = roundRect(ctx, x - calculatedWidth / 2, - y - this.height, calculatedWidth + 8, this.height, 5);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.fillStyle = "black";
        const lines = this.message.split('\n');

        for (let i = 0; i<lines.length; i++) {
            ctx.fillText(lines[i], x - calculatedWidth / 2 + 4, -y - this.height + 10 + (i * this.lineHeight), 200 - 8);
        }
        ctx.restore();
    }

    update(dt: number): void {
        // this.x += 60 * dt / 1000;
    }

    getBoundingClientRect(): { width: number, height: number, left: number, top: number, right: number, bottom: number } {
        return {
            width: this.width,
            height: this.height,
            left: this.x - this.width / 2,
            top: this.y - this.height / 2,
            right: this.x + this.width / 2,
            bottom: this.y + this.height / 2
        }
    }
}
