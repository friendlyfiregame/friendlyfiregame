import { asset } from "./Assets";
import { BitmapFont } from "./BitmapFont";
import { DIALOG_FONT, GAME_CANVAS_WIDTH } from './constants';
import { GameScene } from "./scenes/GameScene";
import { RenderingType, RenderingLayer } from './Renderer';
import { sleep } from "./util";

export const OPTION_BUBBLE_INDENTATION = 11;

export function roundRect(
    ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number,
    up = false, tipOffset = 0
): CanvasRenderingContext2D {
    const halfWidth = w / 2;
    const halfHeight = h / 2;
    const middlePos = x + halfWidth;
    const rightPos = x + w;
    const bottomPos = y + h;

    if (w < 2 * r) { r = halfWidth };
    if (h < 2 * r) { r = halfHeight };

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

export class SpeechBubble {
    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    private messageLines: string[] = [];
    private options: string[] = [];
    public selectedOptionIndex = -1;
    private fontSize = SpeechBubble.font.charHeight;
    private lineHeight = this.fontSize;
    private height = 0;
    private offset = { x: 0, y: 40 };
    private messageVelocity = 20;

    private x: number;
    private y: number;
    private paddingHorizontal: number;
    private paddingVertical: number;
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
        private lineHeightFactor = 1,
        private paddingTop = 3,
        private paddingBottom = 4,
        private paddingLeft = 6,
        private paddingRight = 6,
        private color = "white",
        private relativeToScreen = false
    ) {
        this.x = Math.round(anchorX + this.offset.x);
        this.y = Math.round(anchorY + this.offset.y);
        this.lineHeight = Math.round(this.fontSize * this.lineHeightFactor);
        this.paddingHorizontal = this.paddingLeft + this.paddingRight;
        this.paddingVertical = this.paddingTop + this.paddingBottom;
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
        this.contentLinesByLength = message.split("\n").concat(this.options).sort((a, b) =>
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
        this.height = (this.content.length - 1) * this.lineHeight + this.fontSize + this.paddingVertical;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible || !this.hasContent() || !this.scene.camera.isOnTarget() || !this.scene.isActive()) {
            return;
        }
        const font = SpeechBubble.font;
        const longestLine = this.contentLinesByLength[0];
        const metrics = longestLine ? font.measureText(longestLine + (!!this.partnersBubble ? " " : "")) : { width: 0, height: 0};
        let posX = this.x;
        let posY = this.y;
        let offsetX = 0;

        if (this.relativeToScreen) {
            posX = Math.round(ctx.canvas.width / 2);
            posY = Math.round(-ctx.canvas.height * 0.63 - this.height);
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

        this.scene.renderer.add({
            type: RenderingType.SPEECH_BUBBLE,
            layer: RenderingLayer.UI,
            fillColor: this.color,
            position: {
                x: posX - Math.round(metrics.width / 2) - this.paddingLeft,
                y: -posY - this.height
            },
            dimension: {
                width: metrics.width + this.paddingHorizontal,
                height: this.height
            },
            radius: 5,
            relativeToScreen: this.relativeToScreen,
            offsetX
        });

        const textXPos = Math.round(posX - metrics.width / 2);
        const textColor = "black";

        for (let i = 0; i < this.messageLines.length; i++) {
            const textYPos = Math.round(-posY - this.height + i * this.lineHeight + this.paddingTop);

            this.scene.renderer.add({
                type: RenderingType.TEXT,
                layer: RenderingLayer.UI,
                text: this.messageLines[i],
                textColor: textColor,
                relativeToScreen: this.relativeToScreen,
                position: {
                    x: textXPos,
                    y: textYPos
                },
                asset: font,
            })
        }

        for (let i = 0; i < this.options.length; i++) {
            const isSelected = this.selectedOptionIndex === i;
            const textYPos = Math.round(-posY - this.height + i * this.lineHeight + this.paddingTop);

            if (isSelected) {
                this.scene.renderer.add({
                    type: RenderingType.TEXT,
                    layer: RenderingLayer.UI,
                    text: "►",
                    textColor: textColor,
                    relativeToScreen: this.relativeToScreen,
                    position: {
                        x: textXPos,
                        y: textYPos
                    },
                    asset: font
                })
            }

            this.scene.renderer.add({
                type: RenderingType.TEXT,
                layer: RenderingLayer.UI,
                text: this.options[i],
                textColor: textColor,
                relativeToScreen: this.relativeToScreen,
                position: {
                    x: textXPos + OPTION_BUBBLE_INDENTATION,
                    y: textYPos
                },
                asset: font
            })
        }
    }

    update(anchorX: number, anchorY: number): void {
        this.x = Math.round(anchorX + this.offset.x);
        this.y = Math.round(anchorY + this.offset.y);
    }
}
