import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { GameScene } from './scenes/GameScene';
import { Point } from './Geometry';
import { RenderingLayer } from './Renderer';

export class DialoguePrompt {
    @asset("sprites/dialogue.aseprite.json")
    private static sprite: Aseprite;

    private scene: GameScene;
    private position: Point;
    private timeAlive = 0;
    private floatAmount = 2;
    private floatSpeed = 5;

    public constructor(scene: GameScene, position: Point) {
        this.scene = scene;
        this.position = position.clone();
    }

    draw(): void {
        const floatOffsetY = Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmount;
        this.scene.renderer.addAseprite(
            DialoguePrompt.sprite, "idle", this.position.moveYBy(-floatOffsetY),
            RenderingLayer.ENTITIES
        );
    }

    update(dt: number, anchor: Point): void {
        this.timeAlive += dt;
        this.position.moveTo(anchor.x, anchor.y);
    }
}
