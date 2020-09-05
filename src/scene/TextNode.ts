import { Game } from "../Game";
import { SceneNode, SceneNodeArgs } from "./SceneNode";
import { BitmapFont } from "../BitmapFont";

/**
 * Constructor arguments for [[TextNode]].
 */
export interface TextNodeArgs extends SceneNodeArgs {
    /** The initial font used to draw the text. */
    font: BitmapFont;

    /** Optional initial text to draw. Defaults to empty string. */
    text?: string;

    /** Optional initial text color. Defaults to "white". */
    color?: string;

    /** Optional initial outline text color. Default is null which means no outline is drawn. */
    outlineColor?: string | null;
}

/**
 * Scene node for displaying a text with an optional icon left to it.
 *
 * @param T - Optional owner game class.
 */
export class TextNode<T extends Game = Game> extends SceneNode<T> {
    /** The font used to draw the text. */
    private font: BitmapFont;

    /** The text to draw. */
    private text: string;

    /** The text color. */
    private color: string;

    /** Optional outline color. */
    private outlineColor: string | null;

    /**
     * Creates a new scene node displaying the given image.
     */
    public constructor({ font, text = "", color = "white", outlineColor = null, ...args } : TextNodeArgs) {
        super(args);
        this.font = font;
        this.text = text;
        this.color = color;
        this.outlineColor = outlineColor;
        this.updateSize();
    }

    /**
     * Returns the displayed text.
     *
     * @return The displayed text.
     */
    public getText(): string {
        return this.text;
    }

    /**
     * Sets the displayed text.
     *
     * @param text - The text to set.
     */
    public setText(text: string): this {
        if (text !== this.text) {
            this.text = text;
            this.updateSize();
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the bitmap font used to draw the text.
     *
     * @return The used bitmap font.
     */
    public getFont(): BitmapFont {
        return this.font;
    }

    /**
     * Sets the bitmap font used to draw the text.
     *
     * @param font - The bitmap font to use.
     */
    public setFont(font: BitmapFont): this {
        if (font !== this.font) {
            this.font = font;
            this.updateSize();
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the text color.
     *
     * @return The text color.
     */
    public getColor(): string {
        return this.color;
    }

    /**
     * Sets the text color.
     *
     * @param color - The text color to set.
     */
    public setColor(color: string): this {
        if (color !== this.color) {
            this.color = color;
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the text outline color. Null if none.
     *
     * @return The text outline color. Null if none.
     */
    public getOutlineColor(): string | null {
        return this.outlineColor;
    }

    /**
     * Sets the text color.
     *
     * @param outlineColor - The text color to set.
     */
    public setOutlineColor(outlineColor: string): this {
        if (outlineColor !== this.outlineColor) {
            this.outlineColor = outlineColor;
            this.invalidate();
        }
        return this;
    }

    /**
     * Updates the node size according to the text measurements.
     */
    private updateSize(): void {
        const size = this.font.measureText(this.text);
        this.resizeTo(size.width, size.height);
    }

    /** @inheritDoc */
    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.outlineColor != null) {
            this.font.drawTextWithOutline(ctx, this.text, 0, 0, this.color, this.outlineColor);
        } else {
            this.font.drawText(ctx, this.text, 0, 0, this.color);
        }
    }
}
