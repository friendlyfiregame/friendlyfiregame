import { Aseprite } from './Aseprite'
import { BitmapFont } from './BitmapFont'
import { roundRect } from './SpeechBubble';
import { GameScene } from './scenes/GameScene';

export enum RenderingType {
  BLACK_BARS,
  DRAW_IMAGE,
  ASEPRITE,
  STROKE_RECT,
  ROUND_RECT,
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
  TILEMAP_MAP = "tilemapMap",
  TILEMAP_BACKGROUND = "tilemapBackground",
}

export const LAYER_ORDER: RenderingLayer[] = [
  RenderingLayer.DEBUG,
  RenderingLayer.FULLSCREEN_FX,
  RenderingLayer.UI,
  RenderingLayer.BLACK_BARS,
  RenderingLayer.TILEMAP_FOREGROUND,
  RenderingLayer.PLAYER,
  RenderingLayer.ENTITIES,
  RenderingLayer.TILEMAP_MAP,
  RenderingLayer.TILEMAP_BACKGROUND,
]

export type Coordinates = {
  x: number;
  y: number;
}

export type Dimension = {
  width: number;
  height: number;
}

export type BaseRenderingItem = {
  type: RenderingType;
  layer: RenderingLayer;
  zIndex?: number;
  translation?: Coordinates;
  position: Coordinates;
  scale?: Coordinates;
  relativeToScreen?: boolean,
}

export type BlackBarsRenderingItem = {
  type: RenderingType.BLACK_BARS;
  layer: RenderingLayer;
  force: number;
  height: number;
  color: string;
}

export type StrokeRectRenderingItem = BaseRenderingItem & {
  type: RenderingType.STROKE_RECT;
  color: string,
  lineWidth?: number;
  dimension: Dimension;
}

export type RoundRectRenderingItem = BaseRenderingItem & {
  type: RenderingType.ROUND_RECT;
  fillColor: string,
  radius: number;
  offsetX: number;
  dimension: Dimension;
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

export type RenderingItem = BlackBarsRenderingItem | DrawImageRenderingItem | AsepriteRenderingItem | StrokeRectRenderingItem | TextRenderingItem | RoundRectRenderingItem;

export class RenderingQueue {
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
        } else {
          ctx.save();
          if (item.translation) ctx.translate(item.translation.x, item.translation.y);
          if (item.scale) ctx.scale(item.scale.x, item.scale.y);
          if (item.relativeToScreen) ctx.setTransform(1, 0, 0, 1, 0, 0);
  
          switch(item.type) {
            case RenderingType.DRAW_IMAGE:
              ctx.drawImage(item.asset, item.position.x, item.position.y);
              break;
            case RenderingType.ASEPRITE:
              item.asset.drawTag(ctx, item.animationTag, item.position.x, item.position.y, item.time);
              break;
            case RenderingType.STROKE_RECT:
              ctx.strokeStyle = item.color;
              ctx.lineWidth = item.lineWidth || 1;
              ctx.strokeRect(item.position.x, item.position.y, item.dimension.width, item.dimension.height);
              break;
            case RenderingType.ROUND_RECT:
              ctx.beginPath();
              ctx = roundRect(ctx, item.position.x, item.position.y, item.dimension.width, item.dimension.height, item.radius, item.relativeToScreen, item.offsetX);
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

  public add (item: RenderingItem) {
    this.queue.push(item);
  }
}