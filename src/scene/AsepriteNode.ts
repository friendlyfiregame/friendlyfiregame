import { Game } from "../Game";
import { SceneNode, SceneNodeArgs, SceneNodeAspect } from "./SceneNode";
import { Aseprite } from "../Aseprite";

/**
 * Constructor arguments for [[AsepriteNode]].
 */
export interface AsepriteNodeArgs extends SceneNodeArgs {
    /** The Aseprite to display. */
    aseprite: Aseprite;

    /** Optional animation tag to draw. */
    tag?: string;

    /** Optional initial X mirroring of the sprite. */
    mirrorX?: boolean;
}

/**
 * Scene node for displaying an [[Aseprite]].
 *
 * @param T - Optional owner game class.
 */
export class AsepriteNode<T extends Game = Game> extends SceneNode<T> {
    /** The displayed aseprite. */
    private aseprite: Aseprite;

    /** The animation tag to draw. Null to draw whole animation. */
    private tag: string | null;

    /** The current time index of the animation. */
    private time = 0;

    private mirrorX: boolean;

    /**
     * Creates a new scene node displaying the given Aseprite.
     */
    public constructor({ aseprite, ...args }: AsepriteNodeArgs) {
        super({
            width: aseprite.width,
            height: aseprite.height,
            ...args
        });
        this.aseprite = aseprite;
        this.tag = args.tag ?? null;
        this.mirrorX = args.mirrorX ?? false;
    }

    /**
     * Returns the displayed Aseprite.
     *
     * @return The displayed Aseprite.
     */
    public getAseprite(): Aseprite {
        return this.aseprite;
    }

    /**
     * Sets the Aseprite.
     *
     * @param aseprite - The Aseprite to draw.
     */
    public setAseprite(aseprite: Aseprite): this {
        if (aseprite !== this.aseprite) {
            this.aseprite = aseprite;
            this.resizeTo(aseprite.width, aseprite.height);
            this.invalidate(SceneNodeAspect.RENDERING);
        }
        return this;
    }

    /**
     * Returns the current animation tag. Null if whole animation is displayed.
     *
     * @return The current animation tag or null for whole animation.
     */
    public getTag(): string | null {
        return this.tag;
    }

    /**
     * Sets the animation tag. Null to display whole animation.
     *
     * @param tag - The animation tag to set. Null to unset.
     */
    public setTag(tag: string | null): this {
        if (tag !== this.tag) {
            this.tag = tag;
            this.invalidate(SceneNodeAspect.RENDERING);
        }
        return this;
    }

    public setMirrorX(mirrorX: boolean): this {
        if (mirrorX !== this.mirrorX) {
            this.mirrorX = mirrorX;
            this.invalidate(SceneNodeAspect.RENDERING);
        }
        return this;
    }

    public isMirrorX(): boolean {
        return this.mirrorX;
    }

    /** @inheritDoc */
    public update(dt: number) {
        this.time += dt;
    }

    /** @inheritDoc */
    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        if (this.mirrorX) {
            ctx.translate(this.aseprite.width, 0);
            ctx.scale(-1, 1);
        }
        if (this.tag != null) {
            this.aseprite.drawTag(ctx, this.tag, 0, 0, this.time * 1000);
        } else {
            this.aseprite.draw(ctx, 0, 0, this.time * 1000);
        }
        ctx.restore();
    }
}
