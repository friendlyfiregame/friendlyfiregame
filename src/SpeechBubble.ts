import { asset } from './Assets';
import { BitmapFont } from './BitmapFont';
import { ConversationLine } from './Conversation';
import { DIALOG_FONT, GAME_CANVAS_SIZE } from './constants';
import { GameScene } from './scenes/GameScene';
import { Padding } from './geometry/Padding';
import { Point } from './geometry/Point';
import { RenderingLayer, RenderingType } from './Renderer';
import { Size } from './geometry/Size';
import { sleep } from './util';

export function roundRect(
    ctx: CanvasRenderingContext2D, position: Point, size: Size, r: number,
    up = false, tipOffset = 0
): CanvasRenderingContext2D {
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;
    const middlePos = position.x + halfWidth;
    const rightPos = position.x + size.width;
    const bottomPos = position.y + size.height;

    if (size.width < 2 * r) { r = halfWidth };
    if (size.height < 2 * r) { r = halfHeight };

    ctx.beginPath();
    ctx.moveTo(position.x + r, position.y);

    if (up) {
        ctx.lineTo(middlePos - 4, position.y);
        ctx.lineTo(middlePos, position.y - 4);
        ctx.lineTo(middlePos + 4, position.y);
    }

    ctx.arcTo(rightPos, position.y, rightPos, bottomPos, r);
    ctx.arcTo(rightPos, bottomPos, position.y, bottomPos, r);

    if (!up) {
        ctx.lineTo(middlePos - 4 + tipOffset, bottomPos);
        ctx.lineTo(middlePos + tipOffset, bottomPos + 4);
        ctx.lineTo(middlePos + 4 + tipOffset, bottomPos);
    }

    ctx.arcTo(position.x, bottomPos, position.x, position.y, r);
    ctx.arcTo(position.x, position.y, rightPos, position.y, r);
    ctx.closePath();

    return ctx;
}

export class SpeechBubble {
    @asset(DIALOG_FONT)
    private static font: BitmapFont;
    private static OPTION_BUBBLE_INDENTATION = 11;

    private messageLines: string[] = [];
    private options: string[] = [];
    public selectedOptionIndex = -1;
    private fontSize = SpeechBubble.font.charHeight;
    private lineHeight = this.fontSize;
    private height = 0;
    private offset = new Point(0, 40);
    private messageVelocity = 20;

    private position: Point;
    public isCurrentlyWriting = false;
    public preventUnwantedSelection = false;

    private isVisible = false;

    private content: string [] = [];
    private longestLine: number = 0;

    private partnersBubble: SpeechBubble | null = null;

    constructor(
        private scene: GameScene,
        // TODO: Maybe clone here instead of when calling
        public anchor: Point,
        private lineHeightFactor = 1,
        private padding = new Padding(3, 7, 4, 7),
        private color = "white",
        private relativeToScreen = false
    ) {
        this.position = anchor.rounded.moveBy(this.offset);
        this.lineHeight = Math.round(this.fontSize * this.lineHeightFactor);
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

    public async setMessage(message: string): Promise<void> {
        this.messageLines = [''];
        this.isCurrentlyWriting = true;
        this.longestLine = this.determineMaxLineLength(message.split('\n'));
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

    public setOptions(options: string[], partnersBubble: SpeechBubble) {
        this.partnersBubble = partnersBubble;
        this.options = options;
        this.selectedOptionIndex = this.options.length > 0 ? 0 : -1;
        this.updateContent();
        this.longestLine = this.determineMaxLineLength(this.messageLines);
    }

    private updateContent() {
        this.content = this.messageLines.concat(this.options);
        this.height = (this.content.length - 1) * this.lineHeight + this.fontSize + this.padding.vertical;
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

        let drawingPosition = this.position.clone();
        let offsetX = 0;

        if (this.relativeToScreen) {
            drawingPosition.moveTo(
                Math.round(ctx.canvas.width / 2),
                Math.round(-ctx.canvas.height * 0.63 - this.height)
            );
        } else {
            // Check if Speech Bubble clips the viewport and correct position
            const visibleRect = this.scene.camera.getVisibleRect()
            const relativeX = drawingPosition.x - visibleRect.position.x;

            const clipAmount = Math.max(
                (this.longestLine / 2) + relativeX - GAME_CANVAS_SIZE.width, 0)
                || Math.min(relativeX - (this.longestLine / 2),
                0
            );

            if (clipAmount !== 0) {
                offsetX = clipAmount + (10 * Math.sign(clipAmount));
            }
        }

        drawingPosition.mirrorVertically().moveBy(
            -Math.round(this.longestLine / 2) - this.padding.left - offsetX,
            -this.height
        );

        this.scene.renderer.add({
            type: RenderingType.SPEECH_BUBBLE,
            layer: RenderingLayer.UI,
            fillColor: this.color,
            position: drawingPosition.clone(),
            size: new Size(
                this.longestLine + this.padding.horizontal,
                this.height
            ),
            radius: 5,
            relativeToScreen: this.relativeToScreen,
            offsetX
        });

        drawingPosition.moveBy(this.padding.left, this.padding.top);
        const textColor = "black";

        for (let i = 0; i < this.messageLines.length; i++) {
            drawingPosition.moveYBy(i * this.lineHeight);

            this.scene.renderer.add({
                type: RenderingType.TEXT,
                layer: RenderingLayer.UI,
                text: this.messageLines[i],
                textColor: textColor,
                relativeToScreen: this.relativeToScreen,
                position: drawingPosition.clone(),
                asset: SpeechBubble.font
            });
        }

        drawingPosition.moveXBy(SpeechBubble.OPTION_BUBBLE_INDENTATION);

        for (let i = 0; i < this.options.length; i++) {
            const isSelected = this.selectedOptionIndex === i;
            drawingPosition.moveYBy(i * this.lineHeight);

            if (isSelected) {
                this.scene.renderer.add({
                    type: RenderingType.TEXT,
                    layer: RenderingLayer.UI,
                    text: ConversationLine.OPTION_MARKER,
                    textColor: textColor,
                    relativeToScreen: this.relativeToScreen,
                    position: drawingPosition.clone().moveXBy(-SpeechBubble.OPTION_BUBBLE_INDENTATION),
                    asset: SpeechBubble.font
                });
            }

            this.scene.renderer.add({
                type: RenderingType.TEXT,
                layer: RenderingLayer.UI,
                text: this.options[i],
                textColor: textColor,
                relativeToScreen: this.relativeToScreen,
                position: drawingPosition.clone(),
                asset: SpeechBubble.font
            });
        }
    }

    public update(anchor: Point): void {
        this.position = anchor.rounded.moveBy(this.offset);
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
