import { Animator } from "./Animator";
import { type Trigger } from "./entities/triggers/Trigger";
import { type GameObject } from "./scenes/GameObject";
import { type GameScene } from "./scenes/GameScene";
import { isInstanceOf } from "./util/predicates";
import { type Constructor } from "./util/types";

export interface EntityDistance {
    source: Entity;
    target: Entity;
    distance: number;
}

export type Bounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type EntityConstructor = new (args: EntityArgs) => Entity;

const entities = new Map<string, EntityConstructor>();

export function entity(name: string): (target: EntityConstructor) => void {
    return (type: EntityConstructor) => {
        entities.set(name, type);
    };
}

export function createEntity(name: string, args: EntityArgs): Entity {
    const constructor = entities.get(name);

    if (!constructor) {
        throw new Error("Entity not found: " + name);
    }

    return new constructor(args);
}

export interface EntityArgs {
    scene: GameScene;
    x: number;
    y: number;
    name?: string | null;
    width?: number;
    height?: number;
    isTrigger?: boolean;
    newGamePlus?: boolean | null;
}

export class Entity implements GameObject {
    protected timeAlive = 0;
    protected animator = new Animator(this);
    public readonly scene: GameScene;
    public readonly name: string | null;
    public readonly newGamePlus: boolean | null;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public isTrigger: boolean;

    public constructor({ scene, name = null, x, y, width = 0, height = 0, isTrigger = true, newGamePlus = null }: EntityArgs) {
        this.scene = scene;
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isTrigger = isTrigger;
        this.newGamePlus = newGamePlus;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Nothing to draw
    }

    public update(dt: number): void {
        this.timeAlive += dt;
    }

    public distanceTo(entity: Entity): number {
        const a = this.x - entity.x;
        const b = this.y - entity.y;

        return Math.sqrt(a * a + b * b);
    }

    public get distanceToPlayer(): number {
        return this.distanceTo(this.scene.player);
    }

    protected getClosestEntityInRange(range: number): Entity | null {
        const sortedEntityDistances = this.getEntitiesInRange(range).sort(
            (a, b ) => { return a.distance - b.distance; }
        );

        if (sortedEntityDistances[0] != null) {
            return sortedEntityDistances[0].target;
        } else {
            return null;
        }
    }

    protected getEntitiesInRange(range: number): EntityDistance[] {
        const entitiesInRange: EntityDistance[] = [];

        this.scene.gameObjects.forEach(gameObject => {
            if (gameObject instanceof Entity && gameObject !== this) {
                const distance = this.distanceTo(gameObject);

                if (distance < range) {
                    entitiesInRange.push({source: this, target: gameObject, distance});
                }
            }
        });

        return entitiesInRange;
    }

    protected getClosestEntity(): Entity {
        const entitiesInRange: EntityDistance[] = [];

        this.scene.gameObjects.forEach(gameObject => {
            if (gameObject instanceof Entity && gameObject !== this) {
                const distance = this.distanceTo(gameObject);
                entitiesInRange.push({source: this, target: gameObject, distance});
            }
        });

        entitiesInRange.sort((a, b ) => { return a.distance - b.distance; });

        return entitiesInRange[0].target;
    }

    public getBounds(margin = 0): Bounds {
        const width = this.width + (margin * 2);
        const height = this.height + (margin * 2);
        const x = this.x - (this.width / 2) - margin;
        const y = this.y - -this.height + margin;
        return { x, y, width, height };
    }

    /**
     * Checks wether this entity is currently colliding with the provided named trigger.
     * @param triggerName the trigger name to check against.
     */
    protected isCollidingWithTrigger(trigger: Constructor<Trigger>): boolean {
        return this.scene.world.getEntityCollisions(this).find(isInstanceOf(trigger)) != null;
    }

    public remove(): void {
        this.scene.removeGameObject(this);
    }
}
