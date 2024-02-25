import { GAME_CANVAS_HEIGHT, GAME_CANVAS_WIDTH } from "../shared/constants";
import { type Aseprite } from "./Aseprite";
import { type BitmapFont } from "./BitmapFont";
import { type Dance } from "./Dance";
import { type Fire } from "./entities/Fire";
import { type ParticleEmitter } from "./Particles";
import { type GameScene } from "./scenes/GameScene";
import { roundRect } from "./util";

export enum RenderingType {
    PARTICLE_EMITTER,
    FIRE,
    DANCE,
    BLACK_BARS,
    DRAW_IMAGE,
    ASEPRITE,
    RECT,
    SPEECH_BUBBLE,
    TEXT,
    RAW
}

export enum RenderingLayer {
    TILEMAP_BACKGROUND,
    TILEMAP_MAP,
    PLATFORMS,
    PARTICLES,
    ENTITIES,
    FACES,
    PLAYER,
    TILEMAP_FOREGROUND,
    BLACK_BARS,
    UI,
    FULLSCREEN_FX,
    DEBUG
}

export type Coordinates = {
    x: number;
    y: number;
};

export type Dimension = {
    width: number;
    height: number;
};

export type BaseRenderingItem = {
    type: RenderingType;
    layer: RenderingLayer;
    zIndex?: number;
    translation?: Coordinates;
    position: Coordinates;
    scale?: Coordinates;
    alpha?: number;
    globalCompositeOperation?: GlobalCompositeOperation;
    relativeToScreen?: boolean,
};

export type ParticleEmitterRenderingItem = {
    type: RenderingType.PARTICLE_EMITTER;
    layer: RenderingLayer;
    zIndex: number;
    emitter: ParticleEmitter;
};

export type FireRenderingItem = {
    type: RenderingType.FIRE;
    layer: RenderingLayer;
    entity: Fire;
};

export type DanceRenderingItem = {
    type: RenderingType.DANCE;
    layer: RenderingLayer;
    dance: Dance;
};

export type BlackBarsRenderingItem = {
    type: RenderingType.BLACK_BARS;
    layer: RenderingLayer;
    force: number;
    height: number;
    color: string;
};

export type RectRenderingItem = BaseRenderingItem & {
    type: RenderingType.RECT;
    fillColor?: string,
    lineColor?: string,
    lineWidth?: number;
    dimension: Dimension;
};

export type SpeechBubbleRenderingItem = BaseRenderingItem & {
    type: RenderingType.SPEECH_BUBBLE;
    fillColor: string,
    radius: number;
    offsetX: number;
    dimension: Dimension;
    up: boolean;
};

export type TextRenderingItem = BaseRenderingItem & {
    type: RenderingType.TEXT;
    asset: BitmapFont;
    text: string,
    textColor: string,
    outlineColor?: string,
};

export type DrawImageRenderingItem = BaseRenderingItem & {
    type: RenderingType.DRAW_IMAGE;
    asset: HTMLImageElement;
};

export type AsepriteRenderingItem = BaseRenderingItem & {
    type: RenderingType.ASEPRITE;
    asset: Aseprite;
    animationTag: string;
    time?: number;
};

export type RawRenderingItem = {
    type: RenderingType.RAW;
    layer: RenderingLayer;
    draw: (ctx: CanvasRenderingContext2D) => void;
};

export type RenderingItem = BlackBarsRenderingItem | DrawImageRenderingItem | AsepriteRenderingItem | RectRenderingItem |
                            TextRenderingItem | SpeechBubbleRenderingItem | ParticleEmitterRenderingItem | FireRenderingItem | DanceRenderingItem |
                            RawRenderingItem;

export class Renderer {
    private readonly scene: GameScene;
    private queue: RenderingItem[] = [];

    public constructor(scene: GameScene) {
        this.scene = scene;
    }

    public getLayers(): number {
        let layers = 0;
        for (const item of this.queue) {
            layers |= (1 << item.layer);
        }
        return layers;
    }

    public drawLayer(ctx: CanvasRenderingContext2D, layer: number): void {
        const layerIndex = Math.log2(layer);
        const itemsInLayer = this.queue.filter(item => item.layer === layerIndex);
        itemsInLayer.forEach(item => {
            if (item.type === RenderingType.BLACK_BARS) {
                this.scene.camera.drawBars(ctx);
            } else if (item.type === RenderingType.PARTICLE_EMITTER) {
                item.emitter.draw(ctx);
            } else if (item.type === RenderingType.FIRE) {
                item.entity.drawToCanvas(ctx);
            } else if (item.type === RenderingType.DANCE) {
                item.dance.draw(ctx);
            } else if (item.type === RenderingType.RAW) {
                item.draw(ctx);
            } else {
                ctx.save();
                if (item.translation) ctx.translate(item.translation.x, item.translation.y);
                if (item.scale) ctx.scale(item.scale.x, item.scale.y);
                if (item.relativeToScreen === true) {
                    this.scene.camera.unapplyTransform(ctx);
                    ctx.translate(-GAME_CANVAS_WIDTH / 2, -GAME_CANVAS_HEIGHT / 2);
                }
                if (item.globalCompositeOperation) ctx.globalCompositeOperation = item.globalCompositeOperation;
                if (item.alpha !== undefined) ctx.globalAlpha = item.alpha;

                switch (item.type) {
                    case RenderingType.DRAW_IMAGE:
                        ctx.drawImage(item.asset, item.position.x, item.position.y);
                        break;
                    case RenderingType.ASEPRITE:
                        item.asset.drawTag(ctx, item.animationTag, item.position.x, item.position.y, item.time);
                        break;
                    case RenderingType.RECT:
                        if (item.lineColor != null) {
                            ctx.strokeStyle = item.lineColor;
                            ctx.lineWidth = item.lineWidth ?? 1;
                            ctx.strokeRect(item.position.x, item.position.y, item.dimension.width, item.dimension.height);
                        } else if (item.fillColor != null) {
                            ctx.fillStyle = item.fillColor;
                            ctx.fillRect(item.position.x, item.position.y, item.dimension.width, item.dimension.height);
                        }
                        break;
                    case RenderingType.SPEECH_BUBBLE:
                        ctx.beginPath();
                        ctx = roundRect(ctx, Math.round(item.position.x), Math.round(item.position.y), Math.round(item.dimension.width),
                            Math.round(item.dimension.height), item.radius, item.up, Math.round(item.offsetX));
                        ctx.fillStyle = item.fillColor;
                        ctx.fill();
                        ctx.closePath();
                        break;
                    case RenderingType.TEXT:
                        if (item.outlineColor != null) {
                            item.asset.drawTextWithOutline(ctx, item.text, item.position.x, item.position.y, item.textColor, item.outlineColor);
                        } else {
                            item.asset.drawText(ctx, item.text, item.position.x, item.position.y, item.textColor);
                        }
                        break;
                }

                ctx.restore();
            }
        });
    }

    public clear(): void {
        this.queue = [];
    }

    public add(item: RenderingItem): void {
        this.queue.push(item);
    }

    public addAseprite(
        sprite: Aseprite, animationTag: string, x: number, y: number, layer: RenderingLayer,
        direction = 1, time?: number, alpha?: number
    ): void {
        const scale = direction < 0 ? { x: -1, y: 1 } : undefined;

        this.add({
            type: RenderingType.ASEPRITE,
            layer,
            translation: { x, y },
            position: {
                x: -sprite.width >> 1,
                y: -sprite.height + 1
            },
            scale,
            alpha,
            asset: sprite,
            animationTag,
            time: time ?? this.scene.gameTime * 1000
        });
    }
}
