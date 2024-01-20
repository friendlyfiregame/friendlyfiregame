import { type Game } from "../Game";
import { clamp } from "../util";
import { SceneNode, type SceneNodeArgs } from "./SceneNode";

const DEFAULT_BACKGROUND_STYLE = "#111";
const DEFAULT_BORDER_STYLE = "#222";
const DEFAULT_PROGRESS_STYLE = "#888";
const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 8;

/**
 * Constructor arguments for {@linkcode ProgressBarNode}.
 */
export interface ProgressBarNodeArgs extends SceneNodeArgs {
    backgroundStyle?: string;
    borderStyle?: string
    progressStyle?: string;
}

/**
 * Scene node for displaying a progress bar.
 *
 * @param T - Optional owner game class.
 */
export class ProgressBarNode<T extends Game = Game> extends SceneNode<T> {
    private readonly backgroundStyle: string;
    private readonly borderStyle: string;
    private readonly progressStyle: string;
    private progress: number = 0;

    /**
     * Creates a new scene node displaying the given image.
     */
    public constructor({ backgroundStyle = DEFAULT_BACKGROUND_STYLE, borderStyle = DEFAULT_BORDER_STYLE,
            progressStyle = DEFAULT_PROGRESS_STYLE, ...args }: ProgressBarNodeArgs = {}) {
        super({
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            ...args
        });
        this.backgroundStyle = backgroundStyle;
        this.borderStyle = borderStyle;
        this.progressStyle = progressStyle;
    }

    public setProgress(progress: number): this {
        progress = clamp(progress, 0, 1);
        if (progress !== this.progress) {
            this.progress = progress;
            this.invalidate();
        }
        return this;
    }

    public getProgress(): number {
        return this.progress;
    }

    /** @inheritDoc */
    public override draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        const width = this.getWidth();
        const height = this.getHeight();

        // Draw background
        ctx.fillStyle = this.backgroundStyle;
        ctx.fillRect(0, 0, width, height);

        // Draw progress bar
        ctx.fillStyle = this.progressStyle;
        ctx.fillRect(0, 0, width * this.progress, height);

        // Draw border
        ctx.save();
        ctx.strokeStyle = this.borderStyle;
        ctx.lineWidth = 2;
        ctx.rect(0, 0, width, height);
        ctx.clip();
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }
}
