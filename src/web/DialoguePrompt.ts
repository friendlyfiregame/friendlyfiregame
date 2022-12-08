import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { RenderingLayer } from "./Renderer";

export class DialoguePrompt {
    @asset("sprites/dialogue.aseprite.json")
    private static sprite: Aseprite;

    private scene: GameScene;
    private x: number;
    private y: number;
    private timeAlive = 0;
    private floatAmount = 2;
    private floatSpeed = 5;

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
