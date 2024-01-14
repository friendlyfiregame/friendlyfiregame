import { FontJSON } from "*.font.json";
import { getRenderingContext, loadImage } from "./graphics";

const CHAR_SPACING = 1;

export class BitmapFont {
    private readonly sourceImage: HTMLImageElement;
    private readonly canvas: HTMLCanvasElement;
    private readonly colorMap: Record<string, number>;
    private readonly charMap: string;
    private readonly charWidths: number[];
    private readonly compactablePrecursors: string[][];
    private readonly charStartPoints: number[];
    private readonly charCount: number;
    private readonly charReverseMap: Record<string, number>;
    public charHeight!: number;

    private constructor(
        sourceImage: HTMLImageElement, colors: Record<string, string>, charMap: string,
        charHeight: number, charWidths: number[], compactablePrecursors: string[][], charMargin = 1
    ) {
        this.sourceImage = sourceImage;
        this.canvas = document.createElement("canvas");
        this.charMap = charMap;
        this.charHeight = charHeight;
        this.colorMap = this.prepareColors(colors);
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

        return new BitmapFont(image, json.colors, characters, json.characterHeight, widths, compactablePrecursors, json.margin);
    }

    private prepareColors(colorMap: { [x: string]: string; }): { [x: string]: number } {
        const result: { [x: string]: number} = {};
        const colors = Object.keys(colorMap);
        const count = colors.length;
        const w = this.canvas.width = this.sourceImage.width;
        const h = this.charHeight;
        this.canvas.height = h * count;
        const ctx = getRenderingContext(this.canvas, "2d");

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

    private drawCharacter(ctx: CanvasRenderingContext2D, char: number, color: string): void {
        const colorIndex = this.colorMap[color];
        const charIndex = (typeof char === "number") ? char : this.getCharIndex(char);
        const charX = this.charStartPoints[charIndex], charY = colorIndex * this.charHeight;

        ctx.drawImage(
            this.canvas, charX, charY, this.charWidths[charIndex], this.charHeight,
            0, 0, this.charWidths[charIndex], this.charHeight
        );
    }

    public drawText(
        ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, align = 0,
        alpha = 1
    ): void {
        // Do nothing when no text or alpha is 0
        if (text === "" || alpha === 0) {
            return;
        }

        ctx.save();
        ctx.translate(x, y);

        // Ugly hack to correct text position to exact pixel boundary because Chrome renders broken character images
        // when exactly between two pixels (Firefox doesn't have this problem).
        if (ctx.getTransform) {
            const transform = ctx.getTransform();
            ctx.translate(
                Math.round(transform.e) - transform.e,
                Math.round(transform.f) - transform.f
            );
        }

        ctx.globalAlpha *= alpha;

        const { width } = this.measureText(text);
        ctx.translate(-align * width, 0);

        let precursorChar = null;

        for (const currentChar of text) {
            const index = this.getCharIndex(currentChar);
            const spaceReduction = precursorChar && this.compactablePrecursors[index].includes(precursorChar) ? 1 : 0;
            ctx.translate(-spaceReduction, 0);
            this.drawCharacter(ctx, index, color);
            ctx.translate(this.charWidths[index] + CHAR_SPACING, 0);
            precursorChar = currentChar;
        }

        ctx.restore();
    }

    public measureText(text: string): { width: number, height: number } {
        let width = 0;
        let precursorChar = null;
        for (const currentChar of text) {
            const index = this.getCharIndex(currentChar);
            const spaceReduction = precursorChar && this.compactablePrecursors[index].includes(precursorChar) ? 1 : 0;
            width += this.charWidths[index] - spaceReduction + CHAR_SPACING;
            precursorChar = currentChar;
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
