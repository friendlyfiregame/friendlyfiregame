import { Game } from "../Game";
import { SceneNode, SceneNodeArgs } from "./SceneNode";

/**
 * Constructor arguments for [[ImageNode]].
 */
export interface ImageNodeArgs extends SceneNodeArgs {
    /** The image to be displayed by the image node. */
    image: HTMLImageElement;
}

/**
 * Scene node for displaying an HTMLImageElement.
 *
 * @param T - Optional owner game class.
 */
export class ImageNode<T extends Game = Game> extends SceneNode<T> {
    /** The image to display. */
    private readonly image: HTMLImageElement;

    /**
     * Creates a new scene node displaying the given image.
     */
    public constructor({ image, ...args }: ImageNodeArgs) {
        super({
            width: image.width,
            height: image.height,
            ...args
        });
        this.image = image;
    }

    /**
     * Returns the displayed image.
     *
     * @return The displayed image.
     */
    public getImage(): HTMLImageElement {
        return this.image;
    }

    /** @inheritDoc */
    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, 0, 0);
    }
}
