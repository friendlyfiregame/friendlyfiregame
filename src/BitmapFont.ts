import { FontJSON } from "*.font.json";
import { loadImage } from "./graphics.js";

export class BitmapFont {
    private sourceImage: HTMLImageElement;
    private canvas: HTMLCanvasElement;
    private colorMap: Record<string, number>;
    private charMap: string;
    private charWidths: number[];
    private compactablePrecursors: string[][];
    private charStartPoints: number[];
    private charCount: number;
    private charReverseMap: Record<string, number>;
    public charHeight!: number;

    private constructor(
        sourceImage: HTMLImageElement, colors: Record<string, string>, charMap: string,
        charWidths: number[], compactablePrecursors: string[][], charMargin = 1
    ) {
        this.sourceImage = sourceImage;
        this.canvas = document.createElement("canvas");
        this.colorMap = this.prepareColors(colors);
        this.charMap = charMap;
        this.charWidths = charWidths;
        this.compactablePrecursors = compactablePrecursors;
        this.charStartPoints = [];
        this.charCount = charMap.length;
        this.charReverseMap = {};

        for (let i = 0; i < this.charCount; i++) {
            this.charStartPoints[i] = (i === 0) ? 0 : this.charStartPoints[i - 1] + this.charWidths[i - 1] + charMargin;
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
        const characters = json.characterMapping.map(charDef => charDef.char).join("");
        const widths = json.characterMapping.map(charDef => charDef.width);
        const compactablePrecursors = json.characterMapping.map(charDef => charDef.compactablePrecursors || []);

        return new BitmapFont(image, json.colors, characters, widths, compactablePrecursors, json.margin);
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
    }

    private getCharIndex(char: string): number {
        let charIndex = this.charReverseMap[char];

        if (charIndex == null) {
            // To signalize missing char, use last char, which is a not-def glyph
            charIndex = this.charCount - 1;
        }

        return charIndex;
    }

    private drawCharacter(
        ctx: CanvasRenderingContext2D, char: number, x: number, y: number, color: string
    ): void {
        const colorIndex = this.colorMap[color];
        const charIndex = (typeof char === "number") ? char : this.getCharIndex(char);
        const charX = this.charStartPoints[charIndex], charY = colorIndex * this.charHeight;

        ctx.drawImage(
            this.canvas, charX, charY, this.charWidths[charIndex], this.charHeight,
            Math.round(x), Math.round(y), this.charWidths[charIndex], this.charHeight
        );
    }

    public drawText(
        ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, align = 0,
        alpha = 1
    ): void {
        text = "" + text;
        ctx.globalAlpha = alpha;
        let width = 0;
        let precursorChar = null;

        for (const currentChar of text) {
            const index = this.getCharIndex(currentChar);
            width += this.charWidths[index] + 1;
            const compactablePrecursors = this.compactablePrecursors[index];

            if (precursorChar && compactablePrecursors.includes(precursorChar)) {
                width -= 1;
            }

            precursorChar = currentChar;
        }

        const offX = Math.round(-align * width);
        precursorChar = null;

        for (let i = 0; i < text.length; i++) {
            const currentChar = text[i];
            const index = this.getCharIndex(currentChar);
            const spaceReduction = precursorChar && this.compactablePrecursors[index].includes(precursorChar) ? 1 : 0;

            const xPos = Math.round(x + offX) - spaceReduction;

            this.drawCharacter(ctx, index, xPos, Math.round(y), color);
            x += this.charWidths[index] - spaceReduction + 1;

            precursorChar = currentChar;
        }
    }

    public measureText(text: string): { width: number, height: number } {
        const CHAR_SPACING = 1;
        let width = 0;
        let precursorChar = null;

        for (const char of text) {
            const index = this.getCharIndex(char);
            const compactablePrecursors = this.compactablePrecursors[index];

            width += this.charWidths[index];

            if (precursorChar && !(compactablePrecursors.includes(precursorChar))) {
                width += CHAR_SPACING;
            }

            precursorChar = char;
        }

        if (text.length > 0) {
            width -= CHAR_SPACING;
        }

        return { width, height: this.charHeight };
    }

    public drawTextWithOutline(
        ctx: CanvasRenderingContext2D, text: string, xPos: number, yPos: number, textColor: string,
        outlineColor: string, align = 0
    ): void {
        for (let yOffset = yPos - 1; yOffset <= yPos + 1; yOffset++) {
            for (let xOffset = xPos - 1; xOffset <= xPos + 1; xOffset++) {
                if (xOffset !== xPos || yOffset !== yPos) {
                    this.drawText(ctx, text, xOffset, yOffset, outlineColor, align);
                }
            }
        }

        this.drawText(ctx, text, xPos, yPos, textColor, align);
    }
}
