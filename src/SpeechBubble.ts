import { Game } from "./game";
import { sleep } from "./util";

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
    private messageLines :string[] = [];
    private options: string[] = [];
    public selectedOptionIndex = -1;
    public fontSize = 10;
    public lineHeight = 15;
    public height = 0;
    public offset = { x: 0, y: 40 };
    public messageVelocity = 20;

    public x: number;
    public y: number;
    public isCurrentlyWriting = false;

    private isVisible = false;

    private content: string [] = [];
    private contentLinesByLength: string[] = [];

    private partnersBubble: SpeechBubble | null = null;

    constructor(
        private game: Game,
        public anchorX: number,
        public anchorY: number,
        private color = "#FFBBBB",
        private relativeToScreen = false
    ) {
        this.x = anchorX + this.offset.x;
        this.y = anchorY + this.offset.y;
    }

    public show() {
        this.isVisible = true;
    }

    public hide() {
        this.isVisible = false;
    }

    public hasContent() {
        return this.content.length > 0 &&
            (!this.partnersBubble || !this.partnersBubble.isCurrentlyWriting && this.selectedOptionIndex > -1);
    }

    async setMessage(message: string): Promise<void> {
        this.messageLines = [""];
        this.isCurrentlyWriting = true;
        this.contentLinesByLength = message.split("\n").concat(this.options).slice().sort((a, b) => b.length - a.length);
        let index = 0;
        for (let char of message) {
            if (!char) {
                index++;
                continue
            }
            if (char === "\n") {
                index++;
                this.messageLines.push("")
                continue
            }
            this.messageLines[index] += char;
            if (this.isCurrentlyWriting) {
                await sleep(this.messageVelocity)
            }
            this.updateContent();
        }
        this.isCurrentlyWriting = false;
        this.updateContent();
    }

    setOptions(options: string[], partnersBubble: SpeechBubble) {
        this.partnersBubble = partnersBubble;
        this.options = options;
        this.selectedOptionIndex = this.options.length > 0 ? 0 : -1;
        this.updateContent();
        this.contentLinesByLength = this.content.slice().sort((a, b) => b.length - a.length);
    }

    private updateContent() {
        this.content = this.messageLines.concat(this.options);
        this.height = this.content.length * this.lineHeight;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible || !this.hasContent()) {
            return;
        }

        ctx.save();
        ctx.beginPath();
        const font = this.game.mainFont;
        const longestLine = this.contentLinesByLength[0];
        const metrics = longestLine ? font.measureText(longestLine + (!!this.partnersBubble ? " " : "")) : { width: 0, height: 0};

        let posX = this.x;
        let posY = this.y;
        if (this.relativeToScreen) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            posX = ctx.canvas.width / 2;
            posY = - ctx.canvas.height + 20;
        }

        ctx = roundRect(ctx, posX - metrics.width / 2, - posY - this.height, metrics.width + 8, this.height, 5);
        ctx.fillStyle = this.color;
        ctx.fill();

        let messageLineOffset = 4;
        for (let i = 0; i < this.messageLines.length; i++) {
            this.game.mainFont.drawText(ctx, this.messageLines[i], posX - Math.round(metrics.width / 2) + 4,
                -posY - this.height + 4 + (i * this.lineHeight), "black");
            messageLineOffset += 4;
        }
        for (let i = 0; i < this.options.length; i++) {
            const isSelected = this.selectedOptionIndex === i;
            const selectionIndicator = isSelected ? ">" : " ";
            this.game.mainFont.drawText(ctx, selectionIndicator + this.options[i], posX - Math.round(metrics.width / 2) + 4,
                -posY - this.height + messageLineOffset + (i * this.lineHeight), "black");
        }

        ctx.restore();
    }

    update(anchorX: number, anchorY: number): void {
        this.x = anchorX + this.offset.x;
        this.y = anchorY + this.offset.y;
    }
}
