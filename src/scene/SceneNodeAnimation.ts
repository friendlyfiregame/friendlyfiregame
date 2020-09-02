import { Game } from "../Game";
import { SceneNode } from "./SceneNode";
import { linear, Easing } from "../easings";

export type SceneNodeAnimator<T extends Game = Game> = (sceneNode: SceneNode<T>, value: number) => void;

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

export class SceneNodeAnimation<T extends Game = Game> {
    private readonly sceneNode: SceneNode<T>;
    private readonly animator: SceneNodeAnimator<T>;
    private readonly delay: number;
    private readonly duration: number;
    private readonly lifetime: number;
    private readonly easing: Easing;
    private elapsed: number = 0;

    public constructor(sceneNode: SceneNode<T>, { animator, delay = 0, duration = 1, easing = linear }:
            AnimationArgs<T>) {
        this.sceneNode = sceneNode;
        this.animator = animator;
        this.delay = delay;
        this.duration = duration;
        this.easing = easing;
        this.lifetime = delay + duration;
    }

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

    public finish(): void {
        this.elapsed = this.lifetime;
    }
}
