import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { RenderingLayer } from "./Renderer";
import { type GameScene } from "./scenes/GameScene";

export class DialoguePrompt {
    @asset("sprites/dialogue.aseprite.json")
    private static readonly sprite: Aseprite;

    private readonly scene: GameScene;
    private x: number;
    private y: number;
    private timeAlive = 0;
    private readonly floatAmount = 2;
    private readonly floatSpeed = 5;

    public constructor(scene: GameScene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
    }

    public draw(): void {
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;

        this.scene.renderer.addAseprite(
            DialoguePrompt.sprite,
            "idle",
            this.x, this.y - floatOffsetY,
            RenderingLayer.ENTITIES
        );
    }

    public update(dt: number, anchorX: number, anchorY: number): void {
        this.timeAlive += dt;
        this.x = anchorX;
        this.y = anchorY;
    }
}
