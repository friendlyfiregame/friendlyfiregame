import type { AsepriteJSON, AsepriteFrameJSON, AsepriteFrameTagJSON, AsepriteDirection, AsepriteLayerJSON } from "*.aseprite.json";
import { loadImage } from "./graphics";
import { now } from "./util";

/**
 * Sprite implementation which uses the Aseprite JSON format. Use the static asynchronous [[load]] method to load the
 * sprite and then use [[draw]] or [[drawTag]] to draw the sprite animation.
 */
export class Aseprite {
    private readonly frames: AsepriteFrameJSON[];
    private readonly frameTags: Record<string, AsepriteFrameTagJSON> = {};
    private readonly frameTagDurations: Record<string, number> = {};
    private readonly duration: number;

    private constructor(private readonly json: AsepriteJSON, private readonly image: HTMLImageElement) {
        this.frames = Object.values(json.frames);
        this.duration = this.frames.reduce((duration, frame) => duration + frame.duration, 0);
        for (const frameTag of json.meta.frameTags ?? []) {
            let duration = 0;
            for (let i = frameTag.from; i <= frameTag.to; i++) {
                duration += this.frames[i].duration;
            }
            this.frameTags[frameTag.name] = frameTag;
            this.frameTagDurations[frameTag.name] = duration;
        }
    }

    /**
     * Loads the sprite from the given source.
     *
     * @param source - The URL pointing to the JSON file of the sprite.
     * @return The loaded sprite.
     */
    public static async load(source: string): Promise<Aseprite> {
        const json = await (await fetch(source)).json() as AsepriteJSON;
        const baseURL = new URL(source, location.href);
        const image = await loadImage(new URL(json.meta.image, baseURL));
        return new Aseprite(json, image);
    }

    /**
     * Returns the sprite width in pixels.
     *
     * @return The sprite width in pixels.
     */
    public get width(): number {
        return this.frames[0].sourceSize.w;
    }

    /**
     * Returns the sprite height in pixels.
     *
     * @return The sprite height in pixels.
     */
    public get height(): number {
        return this.frames[0].sourceSize.h;
    }

    private calculateFrameIndex(time: number = now(), duration = this.duration, from = 0, to = this.frames.length - 1,
            direction: AsepriteDirection = "forward"): number {
        let delta = direction === "reverse" ? -1 : 1;
        if (direction === "pingpong") {
            duration = duration * 2 - this.frames[from].duration - this.frames[to].duration;
        }
        let frameTime = time % duration;
        let frameIndex = direction === "reverse" ? to : from;
        while (((delta > 0 && frameIndex < to) || (delta < 0 && frameIndex > from))
                && frameTime >= this.frames[frameIndex].duration) {
            frameTime -= this.frames[frameIndex].duration;
            frameIndex += delta;
            if (frameIndex === to) {
                delta = -delta;
            }
        }
        return frameIndex;
    }

    /**
     * Returns the frame index to be drawn at the given time.
     *
     * @param time - Optional time index of the animation. Current system time is used if not specified.
     * @return The frame index to draw.
     */
    public getFrameIndex(time: number = now()): number {
        return this.calculateFrameIndex(time);
    }

    /**
     * Draws a single sprite animation frame.
     *
     * @param ctx   - The canvas context to draw to.
     * @param index - The frame index to draw.
     * @param x     - The X position in pixels to draw to the sprite at.
     * @param y     - The Y position in pixels to draw to the sprite at.
     */
    public drawFrame(ctx: CanvasRenderingContext2D, index: number, x: number, y: number): void {
        const frame = this.frames[index];
        if (frame == null) {
            throw new Error("Frame index not found: " + index);
        }
        ctx.drawImage(this.image, frame.frame.x, frame.frame.y, frame.frame.w, frame.frame.h,
            Math.round(x) + frame.spriteSourceSize.x, Math.round(y) + frame.spriteSourceSize.y,
            frame.spriteSourceSize.w, frame.spriteSourceSize.h);
    }

    /**
     * Returns the frame index of a tagged sprite animation at the given time.
     *
     * @param tag  - The animation tag to draw.
     * @param time - Optional time index of the animation. Current system time is used if not specified.
     * @return The frame index to draw.
     */
    public getTaggedFrameIndex(tag: string, time: number = now()): number {
        const frameTag = this.frameTags[tag];
        if (frameTag == null) {
            throw new Error("Frame tag not found: " + tag);
        }
        return this.calculateFrameIndex(time, this.frameTagDurations[tag], frameTag.from, frameTag.to,
            frameTag.direction);
    }

    /**
     * Draws a tagged sprite animation.
     *
     * @param ctx  - The canvas context to draw to.
     * @param tag  - The animation tag to draw.
     * @param x    - The X position in pixels to draw to the sprite at.
     * @param y    - The Y position in pixels to draw to the sprite at.
     * @param time - Optional time index of the animation. Current system time is used if not specified.
     */
    public drawTag(ctx: CanvasRenderingContext2D, tag: string, x: number, y: number, time: number = now()): void {
        this.drawFrame(ctx, this.getTaggedFrameIndex(tag, time), x, y);
    }

    /**
     * Draws the untagged sprite animation (Simply all defined frames).
     *
     * @param ctx  - The canvas context to draw to.
     * @param x    - The X position in pixels to draw to the sprite at.
     * @param y    - The Y position in pixels to draw to the sprite at.
     * @param time - Optional time index of the animation. Current system time is used if not specified.
     */
    public draw(ctx: CanvasRenderingContext2D, x: number, y: number, time: number = now()): void {
        const frameIndex = this.calculateFrameIndex(time);
        this.drawFrame(ctx, frameIndex, x, y);
    }

    /**
     * Returns the layer with the given name.
     *
     * @param name - The layer name.
     * @return The found layer. Null if none.
     */
    public getLayer(name: string): AsepriteLayerJSON | null {
        return this.json.meta.layers?.find(layer => layer.name === name) ?? null;
    }
}
