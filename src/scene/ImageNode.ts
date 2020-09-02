import { Game } from "../Game";
import { SceneNode, SceneNodeArgs } from "./SceneNode";

export interface ImageNodeArgs extends SceneNodeArgs {
    image: HTMLImageElement;
}

export class ImageNode<T extends Game = Game> extends SceneNode<T> {
    private readonly image: HTMLImageElement;

    public constructor({ image, ...args }: ImageNodeArgs) {
        super({
            width: image.width,
            height: image.height,
            ...args
        });
        this.image = image;
    }

    public getImage(): HTMLImageElement {
        return this.image;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, 0, 0);
    }
}
