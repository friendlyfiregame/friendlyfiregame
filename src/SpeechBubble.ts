import { asset } from "./Assets";
import { BitmapFont } from "./BitmapFont";
import { ConversationLine } from "./Conversation";
import { DIALOG_FONT, GAME_CANVAS_WIDTH } from "./constants";
import { GameScene } from "./scenes/GameScene";
import { RenderingLayer } from "./Renderer";
import { sleep } from "./util";
import { SceneNode } from "./scene/SceneNode";

export function roundRect(
    ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number,
    up = false, tipOffset = 0
): CanvasRenderingContext2D {
    const halfWidth = w / 2;
    const halfHeight = h / 2;
    const middlePos = x + halfWidth;
    const rightPos = x + w;
    const bottomPos = y + h;

    if (w < 2 * r) { r = halfWidth; }
    if (h < 2 * r) { r = halfHeight; }

    ctx.beginPath();
    ctx.moveTo(x + r, y);

    if (up) {
        ctx.lineTo(middlePos - 4, y);
        ctx.lineTo(middlePos, y - 4);
        ctx.lineTo(middlePos + 4, y);
    }

    ctx.arcTo(rightPos, y, rightPos, bottomPos, r);
    ctx.arcTo(rightPos, bottomPos, x, bottomPos, r);

    if (!up) {
        ctx.lineTo(middlePos - 4 + tipOffset, bottomPos);
        ctx.lineTo(middlePos + tipOffset, bottomPos + 4);
        ctx.lineTo(middlePos + 4 + tipOffset, bottomPos);
    }

    ctx.arcTo(x, bottomPos, x, y, r);
    ctx.arcTo(x, y, rightPos, y, r);
    ctx.closePath();

    return ctx;
}

export class SpeechBubble extends SceneNode {
    @asset(DIALOG_FONT)
    private static font: BitmapFont;
    private static OPTION_BUBBLE_INDENTATION = 11;

    private messageLines: string[] = [];
    private options: string[] = [];
    public selectedOptionIndex = -1;
    private fontSize = SpeechBubble.font.charHeight;
    private lineHeight = this.fontSize;
    private textHeight = 0;
    private offsetX = 0;
    private offsetY = 40;

    private messageVelocity = 20;

    private paddingHorizontal: number;
    private paddingVertical: number;
    public isCurrentlyWriting = false;
    public preventUnwantedSelection = false;

    private isVisible = false;

    private content: string [] = [];
    private longestLine: number = 0;

    private partnersBubble: SpeechBubble | null = null;

    constructor(
        private scene: GameScene,
        private lineHeightFactor = 1,
        private paddingTop = 3,
        private paddingBottom = 4,
        private paddingLeft = 7,
        private paddingRight = 7,
        private color = "white",
        private relativeToScreen = false
    ) {
        super({ layer: RenderingLayer.UI });
        this.lineHeight = Math.round(this.fontSize * this.lineHeightFactor);
        this.paddingHorizontal = this.paddingLeft + this.paddingRight;
        this.paddingVertical = this.paddingTop + this.paddingBottom;
    }

    public show(): void {
        this.isVisible = true;
    }

    public hide(): void {
        this.isVisible = false;
    }

    public hasContent(): boolean {
        return this.content.length > 0 &&
            (!this.partnersBubble || !this.partnersBubble.isCurrentlyWriting && this.selectedOptionIndex > -1);
    }

    public async setMessage(message: string): Promise<void> {
        this.messageLines = [""];
        this.isCurrentlyWriting = true;
        this.longestLine = this.determineMaxLineLength(message.split("\n"));
        let index = 0;

        for (const char of message) {
            if (!char) {
                index++;
                continue;
            }
            if (char === "\n") {
                index++;
                this.messageLines.push("");
                continue;
            }
            this.messageLines[index] += char;
            if (this.isCurrentlyWriting) {
                await sleep(this.messageVelocity);
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

    public setOptions(options: string[], partnersBubble: SpeechBubble) {
        this.partnersBubble = partnersBubble;
        this.options = options;
        this.selectedOptionIndex = this.options.length > 0 ? 0 : -1;
        this.updateContent();
        this.longestLine = this.determineMaxLineLength(this.messageLines);
    }

    private updateContent(): void {
        this.content = this.messageLines.concat(this.options);
        this.textHeight = (this.content.length - 1) * this.lineHeight + this.fontSize + this.paddingVertical;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (
            !this.isVisible
            || !this.hasContent()
            || !this.scene.camera.isOnTarget()
            || !this.scene.isActive()
        ) {
            return;
        }

        let posX = this.offsetX;
        let posY = this.offsetY;
        let offsetX = 0;

        if (this.relativeToScreen) {
            const transform = ctx.getTransform();
            posX = Math.round(ctx.canvas.width / 2) - transform.e;
            posY = Math.round(-ctx.canvas.height * 0.63 - this.textHeight) + transform.f;
        } else {
            // Check if Speech Bubble clips the viewport and correct position
            const visibleRect = this.scene.camera.getVisibleRect(0, 0);
            const relativeX = posX - visibleRect.x;

            const clipAmount = Math.max(
                (this.longestLine / 2) + relativeX - GAME_CANVAS_WIDTH, 0)
                || Math.min(relativeX - (this.longestLine / 2),
                0
            );

            if (clipAmount !== 0) {
                offsetX = clipAmount + (10 * Math.sign(clipAmount));
            }
        }

        posX -= offsetX;

        const bubbleXPos = posX - Math.round(this.longestLine / 2) - this.paddingLeft;
        const bubbleYPos = -posY - this.textHeight;

        ctx.beginPath();
        ctx = roundRect(ctx, Math.round(bubbleXPos), Math.round(bubbleYPos),
            Math.round(this.longestLine + this.paddingHorizontal),
            Math.round(this.textHeight), 5, this.relativeToScreen, Math.round(offsetX));
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        const textXPos = bubbleXPos + this.paddingLeft;
        const textColor = "black";

        for (let i = 0; i < this.messageLines.length; i++) {
            const textYPos = Math.round(bubbleYPos + this.paddingTop + i * this.lineHeight);
            SpeechBubble.font.drawText(ctx, this.messageLines[i], textXPos, textYPos, textColor);
        }

        for (let i = 0; i < this.options.length; i++) {
            const isSelected = this.selectedOptionIndex === i;
            const textYPos = Math.round(bubbleYPos + this.paddingTop + i * this.lineHeight);

            if (isSelected) {
                SpeechBubble.font.drawText(ctx, ConversationLine.OPTION_MARKER, textXPos, textYPos, textColor);
            }

            SpeechBubble.font.drawText(ctx, this.options[i], textXPos + SpeechBubble.OPTION_BUBBLE_INDENTATION,
                textYPos, textColor);
        }
    }

    private determineMaxLineLength(message: string[]): number {
        let lineLengths = message.map(
            line => SpeechBubble.font.measureText(line).width
        );

        lineLengths = lineLengths.concat(
            this.options.map(
                line => SpeechBubble.font.measureText(line).width + SpeechBubble.OPTION_BUBBLE_INDENTATION
            )
        );

        return Math.max(...lineLengths);
    }
}
