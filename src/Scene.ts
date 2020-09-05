import { ControllerManager } from "./input/ControllerManager";
import { Game } from "./Game";
import { Keyboard } from "./input/Keyboard";
import { Scenes } from "./Scenes";
import { Transition } from "./Transition";

/**
 * Constructor type of a scene.
 *
 * @param T - The game type.
 * @param A - Optional scene argument type. A value of this type must be specified when setting or pushing a scene.
 *            Defaults to no argument (void type)
 */
export type SceneConstructor<T extends Game, A = void> = new (game: T) => Scene<T, A>;

/**
 * Abstract base class of a scene.
 *
 * @param T - The game type.
 * @param A - Optional scene argument type. A value of this type must be specified when setting or pushing a scene.
 *            Defaults to no argument (void type)
 */
export abstract class Scene<T extends Game, A = void> {
    public zIndex: number = 0;
    public currentTransition: Transition | null = null;
    public inTransition: Transition | null = null;
    public outTransition: Transition | null = null;

    public constructor(public readonly game: T) {}

    public get keyboard(): Keyboard {
        return this.game.keyboard;
    }

    public get input(): ControllerManager {
        return ControllerManager.getInstance();
    }

    public get scenes(): Scenes<T> {
        return this.game.scenes;
    }

    public isActive(): boolean {
        return this.scenes.activeScene === this;
    }

    /**
     * Called when the scene is pushed onto the stack and before any transitions.
     *
     * @param args - The scene arguments (if any).
     */
    public setup(args: A): Promise<void> | void {}

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
