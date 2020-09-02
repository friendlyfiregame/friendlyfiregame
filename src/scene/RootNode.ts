import { Game } from "../Game";
import { SceneNode } from "./SceneNode";
import { Direction } from "../geom/Direction";
import { Scene } from "../Scene";

export type UpdateRootNode = (dt: number) => void;
export type DrawRootNode = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

export class RootNode<T extends Game> extends SceneNode<T> {
    public constructor(scene: Scene<T>, expose: (update: UpdateRootNode, draw: DrawRootNode) => void) {
        super({ anchor: Direction.CENTER });
        this.scene = scene;
        expose(this.updateAll.bind(this), this.drawAll.bind(this));
    }
}
