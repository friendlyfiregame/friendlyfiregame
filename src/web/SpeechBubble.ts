import { DIALOG_FONT, GAME_CANVAS_WIDTH } from "../shared/constants";
import { asset } from "./Assets";
import { BitmapFont } from "./BitmapFont";
import { ConversationLine } from "./Conversation";
import { RenderingLayer, RenderingType } from "./Renderer";
import type { GameScene } from "./scenes/GameScene";
import { sleep } from "./util";

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
        ctx.lineTo(middlePos - 4 + tipOffset, y);
        ctx.lineTo(middlePos + tipOffset, y - 4);
        ctx.lineTo(middlePos + 4 + tipOffset, y);
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

export class SpeechBubble {
    @asset(DIALOG_FONT)
    private static readonly font: BitmapFont;
    private static readonly OPTION_BUBBLE_INDENTATION = 11;

    private messageLines: string[] = [];
    private options: string[] = [];
    public selectedOptionIndex = -1;
    private readonly fontSize = SpeechBubble.font.charHeight;
    private readonly lineHeight = this.fontSize;
    private height = 0;
    private readonly offset = { x: 0, y: 40 };
    private readonly messageVelocity = 20;

    private x: number;
    private y: number;
    private readonly paddingHorizontal: number;
    private readonly paddingVertical: number;
    public isCurrentlyWriting = false;
    public preventUnwantedSelection = false;

    private isVisible = false;

    private content: string [] = [];
    private longestLine: number = 0;

    private partnersBubble: SpeechBubble | null = null;
    private readonly lineHeightFactor = 1;
    private readonly paddingTop = 3;
    private readonly paddingBottom = 4;
    private readonly paddingLeft = 7;
    private readonly paddingRight = 7;
    private readonly color = "white";

    public constructor(
        private readonly scene: GameScene,
        public anchorX: number,
        public anchorY: number,
        private readonly up = false
    ) {
        this.x = Math.round(anchorX + this.offset.x);
        this.y = Math.round(anchorY + this.offset.y);
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
        await sleep(300);
        this.preventUnwantedSelection = false;
    }

    public setOptions(options: string[], partnersBubble: SpeechBubble): void {
        this.partnersBubble = partnersBubble;
        this.options = options;
        this.selectedOptionIndex = this.options.length > 0 ? 0 : -1;
        this.updateContent();
        this.longestLine = this.determineMaxLineLength(this.messageLines);
    }

    private updateContent(): void {
        this.content = this.messageLines.concat(this.options);
        this.height = (this.content.length - 1) * this.lineHeight + this.fontSize + this.paddingVertical;
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

        let posX = this.x;
        const posY = this.y;
        let offsetX = 0;

        // Check if Speech Bubble clips the viewport and correct position
        const visibleRect = this.scene.camera.getVisibleRect();
        const relativeX = posX - visibleRect.x;

        const clipAmount = Math.max(
            (this.longestLine / 2) + relativeX - GAME_CANVAS_WIDTH, 0)
            || Math.min(relativeX - (this.longestLine / 2),
            0
        );

        if (clipAmount !== 0) {
            offsetX = clipAmount + (10 * Math.sign(clipAmount));
        }

        posX -= offsetX;

        const bubbleXPos = posX - Math.round(this.longestLine / 2) - this.paddingLeft;
        const bubbleYPos = this.up ? -posY + 45 : (-posY - this.height);

        this.scene.renderer.add({
            type: RenderingType.SPEECH_BUBBLE,
            layer: RenderingLayer.UI,
            fillColor: this.color,
            position: {
                x: bubbleXPos,
                y: bubbleYPos
            },
            dimension: {
                width: this.longestLine + this.paddingHorizontal,
                height: this.height
            },
            radius: 5,
            up: this.up,
            offsetX
        });

        const textXPos = bubbleXPos + this.paddingLeft;
        const textColor = "black";

        for (let i = 0; i < this.messageLines.length; i++) {
            const textYPos = Math.round(bubbleYPos + this.paddingTop + i * this.lineHeight);

            this.scene.renderer.add({
                type: RenderingType.TEXT,
                layer: RenderingLayer.UI,
                text: this.messageLines[i],
                textColor: textColor,
                position: {
                    x: textXPos,
                    y: textYPos
                },
                asset: SpeechBubble.font,
            });
        }

        for (let i = 0; i < this.options.length; i++) {
            const isSelected = this.selectedOptionIndex === i;
            const textYPos = Math.round(bubbleYPos + this.paddingTop + i * this.lineHeight);

            if (isSelected) {
                this.scene.renderer.add({
                    type: RenderingType.TEXT,
                    layer: RenderingLayer.UI,
                    text: ConversationLine.OPTION_MARKER,
                    textColor: textColor,
                    position: {
                        x: textXPos,
                        y: textYPos
                    },
                    asset: SpeechBubble.font
                });
            }

            this.scene.renderer.add({
                type: RenderingType.TEXT,
                layer: RenderingLayer.UI,
                text: this.options[i],
                textColor: textColor,
                position: {
                    x: textXPos + SpeechBubble.OPTION_BUBBLE_INDENTATION,
                    y: textYPos
                },
                asset: SpeechBubble.font
            });
        }
    }

    public update(anchorX: number, anchorY: number): void {
        this.x = Math.round(anchorX + this.offset.x);
        this.y = Math.round(anchorY + this.offset.y);
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
