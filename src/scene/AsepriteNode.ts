import { Game } from "../Game";
import { SceneNode, SceneNodeArgs } from "./SceneNode";
import { Aseprite } from "../Aseprite";

export interface AsepriteNodeArgs extends SceneNodeArgs {
    aseprite: Aseprite;
    tag?: string;
}

export class AsepriteNode<T extends Game = Game> extends SceneNode<T> {
    private readonly aseprite: Aseprite;
    private tag: string | null;
    private time = 0;

    public constructor({ aseprite, ...args }: AsepriteNodeArgs) {
        super({
            width: aseprite.width,
            height: aseprite.height,
            ...args
        });
        this.aseprite = aseprite;
        this.tag = args.tag ?? null;
    }

    public getAseprite(): Aseprite {
        return this.aseprite;
    }

    public getTag(): string | null {
        return this.tag;
    }

    public setTag(tag: string | null): this {
        this.tag = tag;
        return this;
    }

    public update(dt: number) {
        this.time += dt;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.tag != null) {
            this.aseprite.drawTag(ctx, this.tag, 0, 0, this.time * 1000);
        } else {
            this.aseprite.draw(ctx, 0, 0, this.time * 1000);
        }
    }
}
