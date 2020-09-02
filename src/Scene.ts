import { ControllerManager } from "./input/ControllerManager";
import { Game } from "./Game";
import { Keyboard } from "./input/Keyboard";
import { Scenes } from "./Scenes";
import { Transition } from "./Transition";
import { RootNode, UpdateRootNode, DrawRootNode } from "./scene/RootNode";

export type SceneConstructor<T extends Game> = new (game: T) => Scene<T>;
export type SceneProperties = Record<string, string | number | boolean> | null;

export abstract class Scene<T extends Game> {
    public zIndex: number = 0;
    public currentTransition: Transition | null = null;
    public inTransition: Transition | null = null;
    public outTransition: Transition | null = null;
    public properties: SceneProperties = null;
    public readonly rootNode: RootNode<T>;
    private updateRootNode!: UpdateRootNode;
    private drawRootNode!: DrawRootNode;

    public constructor(public readonly game: T) {
        this.rootNode = new RootNode(this, (update, draw) => {
            this.updateRootNode = update;
            this.drawRootNode = draw;
        });
    }

    public get keyboard(): Keyboard {
        return this.game.keyboard;
    }

    public get input(): ControllerManager {
        return ControllerManager.getInstance();
    }

    public get scenes(): Scenes<T> {
        return this.game.scenes;
    }

    public setProperties(properties: SceneProperties) {
        this.properties = properties;
    }

    public isActive(): boolean {
        return this.scenes.activeScene === this;
    }

    /**
     * Called when the scene is pushed onto the stack and before any transitions.
     */
    public setup(): Promise<void> | void {}

    /**
     * Called when the scene becomes the top scene on the stack and after the on-stage transition is complete.
     */
    public activate(): Promise<void> | void {}

    /**
     * Called when the scene is no longer the top scene on the stack and before the off-stage transition begins.
     */
    public deactivate(): Promise<void> | void {}

    /**
     * Called when the scene is popped from the scene stack, after any transitions are complete.
     */
    public cleanup(): Promise<void> | void {}

    public update(dt: number): void {
        this.updateRootNode(dt);
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.drawRootNode(ctx, width, height);
    }
}
