import { loadImage } from "./graphics.js";
import { FontJSON } from "*.font.json";

export class BitmapFont {
    private sourceImage: HTMLImageElement;
    private canvas: HTMLCanvasElement;
    private colorMap: Record<string, number>;
    private charMap: string;
    private charWidths: number[];
    private charStartPoints: number[];
    private charCount: number;
    private charReverseMap: Record<string, number>;
    private charHeight!: number;

    private constructor(sourceImage: HTMLImageElement, colors: Record<string, string>, charMap: string,
            charWidths: number[], charMargin = 1) {
        this.sourceImage = sourceImage;
        this.canvas = document.createElement("canvas");

        this.colorMap = this.prepareColors(colors);
        this.charMap = charMap;
        this.charWidths = charWidths;
        this.charStartPoints = [];
        this.charCount = charMap.length;
        this.charReverseMap = {};
        for (var i = 0; i < this.charCount; i++) {
            this.charStartPoints[i] = (i == 0) ? 0 : this.charStartPoints[i - 1] + this.charWidths[i - 1] + charMargin;
            const char = this.charMap[i];
            this.charReverseMap[char] = i;
        }
    }

    /**
     * Loads the sprite from the given source.
     *
     * @param source - The URL pointing to the JSON file of the sprite.
     * @return The loaded sprite.
     */
    public static async load(source: string): Promise<BitmapFont> {
        const json = await (await fetch(source)).json() as FontJSON;
        const baseURL = new URL(source, location.href);
        const image = await loadImage(new URL(json.image, baseURL));
        const characters = json.characterMapping.map(charDef => charDef.char).join('');
        const widths = json.characterMapping.map(charDef => charDef.width)
        return new BitmapFont(image, json.colors, characters, widths, json.margin);
    }

    private prepareColors(colorMap: { [x: string]: string; }): { [x: string]: number } {
        const result: { [x: string]: number} = {};
        const colors = Object.keys(colorMap);
        const count = colors.length;
        const w = this.canvas.width = this.sourceImage.width;
        const h = this.sourceImage.height;
        this.canvas.height = h * count;
        this.charHeight = h;
        const ctx = this.canvas.getContext("2d")!;
        // Fill with font
        for (let i = 0; i < count; i++) {
            result[colors[i]] = i;
            ctx.drawImage(this.sourceImage, 0, h * i);
        }
        // Colorize
        ctx.globalCompositeOperation = "source-in";
        for (let i = 0; i < count; i++) {
            ctx.fillStyle = colorMap[colors[i]];
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, h * i, w, h);
            ctx.clip();
            ctx.fillRect(0, 0, w, h * count);
            ctx.restore();
        }
        ctx.globalCompositeOperation = "source-over";

        return result;
    };

    private getCharIndex(char: string): number {
        let charIndex = this.charReverseMap[char];

        if (charIndex == null) {
            // To signalize missing char, use last char, which is a non-def glyph
            charIndex = this.charCount - 1;
        }

        return charIndex;
    }

    private drawCharacter(ctx: CanvasRenderingContext2D, char: number, x: number, y: number, color: string) {
        const colorIndex = this.colorMap[color];
        const charIndex = (typeof char == "number") ? char : this.getCharIndex(char);
        const charX = this.charStartPoints[charIndex], charY = colorIndex * this.charHeight;
        ctx.drawImage(this.canvas, charX, charY, this.charWidths[charIndex], this.charHeight,
            Math.round(x), Math.round(y), this.charWidths[charIndex], this.charHeight);
    };

    public drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, align = 0, alpha = 1) {
        text = "" + text;
        ctx.globalAlpha = alpha;
        let width = 0;
        for (var char of text) {
            const index = this.getCharIndex(char);
            width += this.charWidths[index] + 1;
        }
        const offX = Math.round(-align * width);
        for (let i = 0; i < text.length; i++) {
            const index = this.getCharIndex(text[i]);
            this.drawCharacter(ctx, index, Math.round(x + offX), Math.round(y), color);
            x += this.charWidths[index] + 1;
        }
    }

    public measureText(text: string): { width: number, height: number } {
        let width = 0;
        for (var char of text) {
            const index = this.getCharIndex(char);
            width += this.charWidths[index] + 1;
        }
        return { width, height: this.charHeight };
    }

    public drawTextWithOutline(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, outlineColor: string, align = 0) {
        const OUTLINE_WIDTH = 1;

        const OUTLINE_TOP_POS = y - OUTLINE_WIDTH
        const OUTLINE_RIGHT_POS = x + OUTLINE_WIDTH
        const OUTLINE_BOTTOM_POS = y + OUTLINE_WIDTH
        const OUTLINE_LEFT_POS = x - OUTLINE_WIDTH

        this.drawText(ctx, text, x, OUTLINE_TOP_POS, outlineColor, align);
        this.drawText(ctx, text, OUTLINE_RIGHT_POS, OUTLINE_TOP_POS, outlineColor, align);
        this.drawText(ctx, text, OUTLINE_RIGHT_POS, y, outlineColor, align);
        this.drawText(ctx, text, OUTLINE_RIGHT_POS, OUTLINE_BOTTOM_POS, outlineColor, align);
        this.drawText(ctx, text, x, OUTLINE_BOTTOM_POS, outlineColor, align);
        this.drawText(ctx, text, OUTLINE_LEFT_POS, OUTLINE_BOTTOM_POS, outlineColor, align);
        this.drawText(ctx, text, OUTLINE_LEFT_POS, y, outlineColor, align);
        this.drawText(ctx, text, OUTLINE_LEFT_POS, OUTLINE_TOP_POS, outlineColor, align);

        this.drawText(ctx, text, x, y, color, align);
    };
}
