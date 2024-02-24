import { Animator } from "./Animator";
import { type Trigger } from "./entities/triggers/Trigger";
import { type Game } from "./Game";
import { Direction } from "./geom/Direction";
import { SceneNode, type SceneNodeArgs } from "./scene/SceneNode";
import { type GameObject } from "./scenes/GameObject";
import { type GameScene } from "./scenes/GameScene";
import { isEntityName, isInstanceOf } from "./util/predicates";
import { type Constructor } from "./util/types";

export type Bounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type EntityConstructor = Function & (new (args: EntityArgs) => Entity);

const entities = new Map<string, EntityConstructor>();

export function entity(name: string): (type: EntityConstructor) => void {
    return (type: EntityConstructor) => {
        entities.set(name, type);
    };
}

export function createEntity(type: string, args: EntityArgs): Entity {
    const constructor = entities.get(type);

    if (!constructor) {
        throw new Error(`No entity with type '${type}' found`);
    }

    return new constructor({ ...args });
}

export interface EntityArgs extends SceneNodeArgs {
    scene: GameScene;
    x: number;
    y: number;
    name?: string | null;
    width?: number;
    height?: number;
    isTrigger?: boolean;
    reversed?: boolean;
    newGamePlus?: boolean | null;
}

export class Entity extends SceneNode<Game> implements GameObject {
    protected timeAlive = 0;
    protected readonly animator = new Animator(this);
    public override scene: GameScene;
    public readonly name: string | null;
    public readonly newGamePlus: boolean | null;
    public readonly isTrigger: boolean;
    private readonly reversed: boolean;

    public constructor({ scene, name = null, x, y, width = 0, height = 0, isTrigger = true, newGamePlus = null, reversed = false, ...args }: EntityArgs) {
        super({ ...args, x, y, width, height, anchor: reversed ? Direction.BOTTOM : Direction.TOP_LEFT, childAnchor: Direction.BOTTOM });
        this.scene = scene;
        this.name = name;
        this.isTrigger = isTrigger;
        this.newGamePlus = newGamePlus;
        this.reversed = reversed;
    }

    public setup(): void {
        // Nothing to setup
    }

    public render(): void {
        // Nothing to draw
    }

    public override update(dt: number): void {
        this.timeAlive += dt;
        super.update(dt);
    }

    public distanceTo(entity: Entity): number {
        const a = this.x - entity.x;
        const b = this.y - entity.y;

        return Math.sqrt(a * a + b * b);
    }

    public get distanceToPlayer(): number {
        return this.distanceTo(this.scene.player);
    }

    public getBounds(margin = 0): Bounds {
        const width = this.width + (margin * 2);
        const height = this.height + (margin * 2);
        const x = this.x - (this.width / 2) - margin;
        const y = this.y - (this.reversed ? this.height : 0) - margin;
        return { x, y, width, height };
    }

    /**
     * Checks wether this entity is currently colliding with the provided named trigger.
     *
     * @param trigger - the trigger class or name to check against.
     */
    protected isCollidingWithTrigger(trigger: Constructor<Trigger> | string): boolean {
        return this.scene.world.getEntityCollisions(this).find(typeof trigger === "string" ? isEntityName(trigger) : isInstanceOf(trigger)) != null;
    }

    public override remove(): this {
        this.scene.removeGameObject(this);
        return super.remove();
    }
}
