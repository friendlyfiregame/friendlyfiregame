import { Transition } from "./Transition";
import { Game } from "./Game";
import { Keyboard } from "./Keyboard";
import { Scenes } from "./Scenes";

export type SceneConstructor<T extends Game> = new (game: T) => Scene<T>;
export type SceneProperties = Record<string, string | number | boolean> | null;

export abstract class Scene<T extends Game> {
    public zIndex: number = 0;
    public currentTransition: Transition | null = null;
    public inTransition: Transition | null = null;
    public outTransition: Transition | null = null;
    public properties: SceneProperties = null;

    public constructor(public readonly game: T) {}

    public get keyboard(): Keyboard {
        return this.game.keyboard;
    }

    public get scenes(): Scenes<T> {
        return this.game.scenes;
    }

    public setProperties(properties: SceneProperties) {
        this.properties = properties;
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

    public update(dt: number): void {}

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {}
}
