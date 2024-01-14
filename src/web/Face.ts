import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./entities/NPC";
import { RenderingLayer, RenderingType } from "./Renderer";

export enum FaceModes {
    BLINK = "blink",
    NEUTRAL = "neutral",
    ANGRY = "angry",
    BORED = "bored",
    AMUSED = "amused",
    SAD = "sad",
    DISGUSTED = "disgusted"
}

export enum EyeType {
    STANDARD = 0,
    TREE = 1,
    STONE = 2,
    FLAMEBOY = 3,
    STONEDISCIPLE = 4,
    FLAMEBOY2 = 5,
}

export class Face {
    @asset([
        "sprites/eyes/standard.aseprite.json",
        "sprites/eyes/tree.aseprite.json",
        "sprites/eyes/stone.aseprite.json",
        "sprites/eyes/flameboy.aseprite.json",
        "sprites/eyes/stonedisciple.aseprite.json",
        "sprites/eyes/flameboy2.aseprite.json",
    ])
    private static readonly sprites: Aseprite[];

    private mode = FaceModes.NEUTRAL;
    private direction = 1; // 1 = right, -1 = left

    public constructor(
        private readonly scene: GameScene,
        private readonly owner: NPC,
        private readonly eyeType: EyeType,
        private readonly offX = 0,
        private offY = 20
    ) {}

    public setMode(mode: FaceModes): void {
        this.mode = mode;
    }

    public setOffY(offY: number): void {
        this.offY = offY;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const sprite = Face.sprites[this.eyeType];

        this.scene.renderer.add({
            type: RenderingType.ASEPRITE,
            layer: RenderingLayer.ENTITIES,
            asset: sprite,
            scale: {
                x: this.direction,
                y: 1
            },
            translation: {
                x: this.owner.x + this.offX,
                y: -this.owner.y - this.offY
            },
            position: {
                x: -sprite.width >> 1,
                y: -sprite.height
            },
            animationTag: this.mode,
            time: this.scene.gameTime * 1000
        });
    }

    public toggleDirection(direction = this.direction > 0 ? -1 : 1): void {
        if (direction !== this.direction) {
            this.direction = direction;
        }
    }
    public setDirection(direction: number): void {
        this.direction = direction;
    }
}
