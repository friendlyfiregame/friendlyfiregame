import { type Game } from "../Game";
import { type GameScene } from "../scenes/GameScene";
import { type PostDrawHints, SceneNode } from "./SceneNode";

export class RendererNode extends SceneNode<Game> {
    private readonly gameScene: GameScene;
    public constructor(gameScene: GameScene) {
        super();
        this.gameScene = gameScene;
    }

    protected override updateChildren(dt: number): number {
        return super.updateChildren(dt) | this.gameScene.renderer.getLayers();
    }

    protected override drawChildren(ctx: CanvasRenderingContext2D, layer: number, width: number, height: number): PostDrawHints {
        this.gameScene.renderer.drawLayer(ctx, layer);
        return super.drawChildren(ctx, layer, width, height);
    }
}
