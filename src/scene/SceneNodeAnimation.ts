import { Game } from "../Game";
import { SceneNode } from "./SceneNode";
import { linear, Easing } from "../easings";

/**
 * Function signature for a scene node animator. Function is called with the scene node to animate as first parameter
 * and the current animation time index (0.0 - 1.0).
 */
export type SceneNodeAnimator<T extends Game = Game> = (sceneNode: SceneNode<T>, value: number) => void;

/**
 * Constructor arguments for [[SceneNodeAnimation]]
 */
export interface AnimationArgs<T extends Game = Game> {
    /** The animator function. */
    animator: SceneNodeAnimator<T>;

    /** Number of seconds to wait until animations starts. Defaults to 0. */
    delay?: number;

    /** Duration of the animation in seconds. Defaults to 1. */
    duration?: number;

    /** The easing function to use. Defaults to linear. */
    easing?: Easing;
}

/**
 * Scene node animation. Instance is created internally within [[SceneNode]] when you call [[SceneNode.animate]].
 *
 * @param T - Optional owner game class.
 */
export class SceneNodeAnimation<T extends Game = Game> {
    /** The scene node to animate. */
    private readonly sceneNode: SceneNode<T>;

    /** The animator function. */
    private readonly animator: SceneNodeAnimator<T>;

    /** The delay in seconds before actual animation starts. */
    private readonly delay: number;

    /** The duration of the animation in seconds. */
    private readonly duration: number;

    /** The total lifetime of the animation (delay + duration). */
    private readonly lifetime: number;

    /** The easing function to use for easing the animation. */
    private readonly easing: Easing;

    /** Time elapsed so far within the animation (including delay). */
    private elapsed: number = 0;

    /**
     * Creates scene node animation for the given scene node and with the given animation arguments. You usually
     * don't create an instance of this class yourself. Instead you have to use the [[SceneNode.animate]] method.
     */
    public constructor(sceneNode: SceneNode<T>, { animator, delay = 0, duration = 1, easing = linear }:
            AnimationArgs<T>) {
        this.sceneNode = sceneNode;
        this.animator = animator;
        this.delay = delay;
        this.duration = duration;
        this.easing = easing;
        this.lifetime = delay + duration;
    }

    /**
     * Updates the animation.
     *
     * @param dt - The time in seconds since the last update.
     */
    public update(dt: number): boolean {
        this.elapsed += dt;
        if (this.elapsed < this.lifetime) {
            if (this.elapsed > this.delay) {
                const timeIndex = ((this.elapsed - this.delay) / this.duration) % 1;
                this.animator(this.sceneNode, this.easing(timeIndex));
            }
            return false;
        } else {
            this.animator(this.sceneNode, 1);
            return true;
        }
    }

    /**
     * Finishes the animation by fast-forwarding the animation index to the end of the animation lifetime.
     */
    public finish(): void {
        this.elapsed = this.lifetime;
    }
}
