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

export class SpeechBubble {
    public fontSize = 10;
    public lineHeight = 15;
    public height = this.message.split("\n").length * this.lineHeight;
    public offset = {x: 0, y: 40};

    public x: number;
    public y: number;

    constructor(
        private game: Game,
        public anchorX: number,
        public anchorY: number,
        private color = "#FFBBBB",
        public message = "",
    ) {
        this.x = anchorX + this.offset.x;
        this.y = anchorY + this.offset.y;
    }

    setMessage(message: string) {
        this.message = message;
        this.height = this.message.split("\n").length * this.lineHeight;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        const font = this.game.mainFont;
        const metrics = font.measureText(this.message.split("\n").sort((a, b) => b.length - a.length)[0]);
        ctx = roundRect(ctx, this.x - metrics.width / 2, - this.y - this.height, metrics.width + 8, this.height, 5);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.fillStyle = "black";
        const lines = this.message.split('\n');
        for (let i = 0; i < lines.length; i++) {
            this.game.mainFont.drawText(ctx, lines[i], this.x - Math.round(metrics.width / 2) + 4,
                -this.y - this.height + 4 + (i * this.lineHeight), "black");
        }

        ctx.restore();
    }

    update(anchorX: number, anchorY: number): void {
        this.x = anchorX + this.offset.x;
        this.y = anchorY + this.offset.y;
    }
}
