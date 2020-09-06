import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { GameScene } from "./scenes/GameScene";
import { RenderingLayer } from "./Renderer";
import { SceneNode } from "./scene/SceneNode";

export class DialoguePrompt extends SceneNode {
    @asset("sprites/dialogue.aseprite.json")
    private static sprite: Aseprite;

    private scene: GameScene;
    private offsetX = 0;
    private offsetY = 0;
    private timeAlive = 0;
    private floatAmount = 2;
    private floatSpeed = 5;

    public constructor(scene: GameScene) {
        super();
        this.setLayer(RenderingLayer.ENTITIES);
        this.scene = scene;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;

        this.scene.renderer.drawAseprite(
            ctx,
            DialoguePrompt.sprite,
            "idle",
            this.offsetX, this.offsetY - floatOffsetY,
            1
        );
    }

    public update(dt: number) {
        this.timeAlive += dt;
    }

    public updatePosition(anchorX: number, anchorY: number): void {
        this.offsetX = anchorX;
        this.offsetY = anchorY;
    }
}
