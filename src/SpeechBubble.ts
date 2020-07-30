import { sleep } from "./util";
import { asset } from "./Assets";
import { BitmapFont } from "./BitmapFont";
import { GameScene } from "./scenes/GameScene";
import { GAME_CANVAS_WIDTH } from './constants';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, up = false, tipOffset = 0):
        CanvasRenderingContext2D {
    if (w < 2 * r) {r = w / 2};
    if (h < 2 * r) {r = h / 2};
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    if (up) {
        ctx.lineTo(x + w / 2 - 4, y);
        ctx.lineTo(x + w / 2, y - 4);
        ctx.lineTo(x + w / 2 + 4, y);
    }
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    if (!up) {
        ctx.lineTo(x + w / 2 - 4 + tipOffset, y + h);
        ctx.lineTo(x + w / 2 + tipOffset, y + h + 4);
        ctx.lineTo(x + w / 2 + 4 + tipOffset, y + h);
    }
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    return ctx;
  }

export class SpeechBubble {
    @asset("fonts/standard.font.json")
    private static font: BitmapFont;

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
    public preventUnwantedSelection = false;

    private isVisible = false;

    private content: string [] = [];
    private contentLinesByLength: string[] = [];

    private partnersBubble: SpeechBubble | null = null;

    constructor(
        private scene: GameScene,
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
        const font = SpeechBubble.font;
        this.contentLinesByLength = message.split("\n").concat(this.options).slice().sort((a, b) =>
            font.measureText(b).width - font.measureText(a).width);
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
        this.preventUnwantedSelection = true;
        this.updateContent();
        this.isCurrentlyWriting = false;
        setTimeout(() => {
            this.preventUnwantedSelection = false;
        }, 300);
    }

    setOptions(options: string[], partnersBubble: SpeechBubble) {
        this.partnersBubble = partnersBubble;
        this.options = options;
        this.selectedOptionIndex = this.options.length > 0 ? 0 : -1;
        this.updateContent();
        const font = SpeechBubble.font;
        this.contentLinesByLength = this.content.slice().sort((a, b) =>
            font.measureText(b).width - font.measureText(a).width);
    }

    private updateContent() {
        this.content = this.messageLines.concat(this.options);
        this.height = this.content.length * this.lineHeight;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible || !this.hasContent() || !this.scene.camera.isOnTarget() || !this.scene.isActive()) {
            return;
        }

        ctx.save();
        const font = SpeechBubble.font;
        const longestLine = this.contentLinesByLength[0];
        const metrics = longestLine ? font.measureText(longestLine + (!!this.partnersBubble ? " " : "")) : { width: 0, height: 0};

        let posX = this.x;
        let posY = this.y;
        let offsetX = 0;
        if (this.relativeToScreen) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            posX = ctx.canvas.width / 2;
            posY = - ctx.canvas.height * 0.63 - this.height;
        } else {
            // Check if Speech Bubble clips the viewport and correct position
            const visibleRect = this.scene.camera.getVisibleRect()
            const relativeX = posX - visibleRect.x;
            const clipAmount = Math.max((metrics.width / 2) + relativeX - GAME_CANVAS_WIDTH, 0) || Math.min(relativeX - (metrics.width / 2), 0);

            if (clipAmount !== 0) {
                offsetX = clipAmount + (10 * Math.sign(clipAmount));
            }
        }

        posX -= offsetX;

        ctx.beginPath();
        ctx = roundRect(ctx, posX - metrics.width / 2 - 4, - posY - this.height, metrics.width + 8, this.height, 5,
            this.relativeToScreen, offsetX);
        ctx.fillStyle = this.color;
        ctx.fill();

        const leftPos = Math.round(posX - metrics.width / 2);
        let messageLineOffset = 4;
        const textColor = "black";

        for (let i = 0; i < this.messageLines.length; i++) {
            font.drawText(ctx, this.messageLines[i], leftPos,
                Math.round(-posY - this.height + 4 + (i * this.lineHeight)), textColor);
            messageLineOffset += 4;
        }
        for (let i = 0; i < this.options.length; i++) {
            const topPos = Math.round(-posY - this.height + messageLineOffset + (i * this.lineHeight));
            const isSelected = this.selectedOptionIndex === i;

            if (isSelected) {
                font.drawText(ctx, "►", leftPos, topPos, textColor)
            }

            font.drawText(ctx, this.options[i], leftPos + 11, topPos, textColor);
        }

        ctx.restore();
    }

    update(anchorX: number, anchorY: number): void {
        this.x = anchorX + this.offset.x;
        this.y = anchorY + this.offset.y;
    }
}
