import { Aseprite } from './Aseprite'
import { BitmapFont } from './BitmapFont'
import { Dance } from './Dance';
import { Fire } from './Fire';
import { GameScene } from './scenes/GameScene';
import { ParticleEmitter } from './Particles';
import { Point, Size } from './Geometry';
import { roundRect } from './SpeechBubble';

export enum RenderingType {
    PARTICLE_EMITTER,
    FIRE,
    DANCE,
    BLACK_BARS,
    DRAW_IMAGE,
    ASEPRITE,
    RECT,
    SPEECH_BUBBLE,
    TEXT
}

export enum RenderingLayer {
    DEBUG = 'debug',
    FULLSCREEN_FX = 'fullscreenFX',
    UI = 'ui',
    BLACK_BARS = 'blackBars',
    TILEMAP_FOREGROUND = "tilemapForeground",
    PLAYER = "player",
    ENTITIES = "entities",
    PLATFORMS = "platforms",
    TILEMAP_MAP = "tilemapMap",
    TILEMAP_BACKGROUND = "tilemapBackground",
    PARTICLES = "particles"
}

export const LAYER_ORDER: RenderingLayer[] = [
    RenderingLayer.DEBUG,
    RenderingLayer.FULLSCREEN_FX,
    RenderingLayer.UI,
    RenderingLayer.BLACK_BARS,
    RenderingLayer.TILEMAP_FOREGROUND,
    RenderingLayer.PLAYER,
    RenderingLayer.ENTITIES,
    RenderingLayer.PARTICLES,
    RenderingLayer.PLATFORMS,
    RenderingLayer.TILEMAP_MAP,
    RenderingLayer.TILEMAP_BACKGROUND,
]

export type BaseRenderingItem = {
    type: RenderingType;
    layer: RenderingLayer;
    zIndex?: number;
    translation?: Point;
    position: Point;
    scale?: Point;
    alpha?: number;
    globalCompositeOperation?: string;
    relativeToScreen?: boolean,
}

export type ParticleEmitterRenderingItem = {
    type: RenderingType.PARTICLE_EMITTER;
    layer: RenderingLayer;
    emitter: ParticleEmitter;
}

export type FireRenderingItem = {
    type: RenderingType.FIRE;
    layer: RenderingLayer;
    entity: Fire;
}

export type DanceRenderingItem = {
    type: RenderingType.DANCE;
    layer: RenderingLayer;
    dance: Dance;
}

export type BlackBarsRenderingItem = {
    type: RenderingType.BLACK_BARS;
    layer: RenderingLayer;
    force: number;
    height: number;
    color: string;
}

export type RectRenderingItem = BaseRenderingItem & {
    type: RenderingType.RECT;
    fillColor?: string,
    lineColor?: string,
    lineWidth?: number;
    size: Size;
}

export type SpeechBubbleRenderingItem = BaseRenderingItem & {
    type: RenderingType.SPEECH_BUBBLE;
    fillColor: string,
    radius: number;
    offsetX: number;
    size: Size;
}

export type TextRenderingItem = BaseRenderingItem & {
    type: RenderingType.TEXT;
    asset: BitmapFont;
    text: string,
    textColor: string,
    outlineColor?: string,
}

export type DrawImageRenderingItem = BaseRenderingItem & {
    type: RenderingType.DRAW_IMAGE;
    asset: HTMLImageElement;
}

export type AsepriteRenderingItem = BaseRenderingItem & {
    type: RenderingType.ASEPRITE;
    asset: Aseprite;
    animationTag: string;
    time?: number;
}

export type RenderingItem = BlackBarsRenderingItem | DrawImageRenderingItem | AsepriteRenderingItem | RectRenderingItem |
                            TextRenderingItem | SpeechBubbleRenderingItem | ParticleEmitterRenderingItem | FireRenderingItem | DanceRenderingItem;

export class Renderer {
    private scene: GameScene;
    private layers = LAYER_ORDER;
    private queue: RenderingItem[] = [];

    public constructor(scene: GameScene) {
        this.scene = scene;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        [...this.layers].reverse().forEach(layer => {
            const itemsInLayer = this.queue.filter(item => item.layer === layer);

            itemsInLayer.forEach(item => {
                if (item.type === RenderingType.BLACK_BARS) {
                    this.scene.camera.drawBars(ctx);
                } else if (item.type === RenderingType.PARTICLE_EMITTER) {
                    item.emitter.draw(ctx);
                } else if (item.type === RenderingType.FIRE) {
                    item.entity.drawToCanvas(ctx);
                } else if (item.type === RenderingType.DANCE) {
                    item.dance.draw(ctx);
                } else {
                    ctx.save();
                    if (item.translation) ctx.translate(item.translation.x, item.translation.y);
                    if (item.scale) ctx.scale(item.scale.x, item.scale.y);
                    if (item.relativeToScreen) ctx.setTransform(1, 0, 0, 1, 0, 0);
                    if (item.globalCompositeOperation) ctx.globalCompositeOperation = item.globalCompositeOperation;
                    if (item.alpha !== undefined) ctx.globalAlpha = item.alpha;

                    switch(item.type) {
                        case RenderingType.DRAW_IMAGE:
                            ctx.drawImage(item.asset, item.position.x, item.position.y);
                            break;
                        case RenderingType.ASEPRITE:
                            item.asset.drawTag(ctx, item.animationTag, item.position.x, item.position.y, item.time);
                            break;
                        case RenderingType.RECT:
                            if (item.lineColor) {
                                ctx.strokeStyle = item.lineColor;
                                ctx.lineWidth = item.lineWidth || 1;
                                ctx.strokeRect(item.position.x, item.position.y, item.size.width, item.size.height);
                            } else if (item.fillColor) {
                                ctx.fillStyle = item.fillColor;
                                ctx.fillRect(item.position.x, item.position.y, item.size.width, item.size.height);
                            }
                            break;
                        case RenderingType.SPEECH_BUBBLE:
                            ctx.beginPath();
                            ctx = roundRect(ctx, item.position, item.size, item.radius, item.relativeToScreen, item.offsetX);
                            ctx.fillStyle = item.fillColor;
                            ctx.fill();
                            break;
                        case RenderingType.TEXT:
                            if (item.outlineColor) {
                                item.asset.drawTextWithOutline(ctx, item.text, item.position.x, item.position.y, item.textColor, item.outlineColor);
                            } else {
                                item.asset.drawText(ctx, item.text, item.position.x, item.position.y, item.textColor);
                            }
                            break;
                    }
                    ctx.restore();
                }
            });
        })
        this.queue = [];
    }

    public add(item: RenderingItem) {
        this.queue.push(item);
    }

    public addAseprite(
        sprite: Aseprite, animationTag: string, position: Point, layer: RenderingLayer,
        direction = 1, time?: number
    ): void {
        const scale = direction < 0 ? new Point(-1, 1) : undefined;

        this.add({
            type: RenderingType.ASEPRITE,
            layer,
            translation: new Point(position.x, -position.y),
            position: new Point(-sprite.width >> 1, -sprite.height),
            scale,
            asset: sprite,
            animationTag,
            time: time || this.scene.gameTime * 1000
        });
    }
}
