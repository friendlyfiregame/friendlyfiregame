import { Animator } from "./Animator";
import { GameObject, GameScene } from "./scenes/GameScene";
import { GameObjectProperties } from "./MapInfo";
import { FriendlyFire } from "./FriendlyFire";
import { SceneNode } from "./scene/SceneNode";
import { Direction } from "./geom/Direction";

export interface EntityDistance {
    source: Entity;
    target: Entity;
    distance: number;
}

export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

type EntityConstructor = new (scene: GameScene, x: number, y: number, properties: GameObjectProperties) => Entity;

const entities = new Map<string, EntityConstructor>();

export function entity(name: string): (target: EntityConstructor) => void {
    return (type: EntityConstructor) => {
        entities.set(name, type);
    };
}

export function createEntity(
    name: string, scene: GameScene, x: number, y: number, properties: GameObjectProperties
): Entity {
    const constructor = entities.get(name);

    if (!constructor) {
        throw new Error("Entity not found: " + name);
    }

    return new constructor(scene, x, y, properties);
}

export abstract class Entity extends SceneNode<FriendlyFire> implements GameObject {
    protected timeAlive = 0;
    protected animator = new Animator(this);

    constructor(
        public scene: GameScene,
        x: number,
        y: number,
        width = 0,
        height = 0,
        public isTrigger = true
    ) {
        super({ x, y, width, height, anchor: Direction.TOP_LEFT, childAnchor: Direction.TOP_LEFT });
        this.mirroredY = true;
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;

    public update(dt: number): void {
        this.timeAlive += dt;
    }

    public distanceTo(entity: Entity): number {
        const a = this.getX() - entity.getX();
        const b = this.getY() - entity.getY();

        return Math.sqrt(a * a + b * b);
    }

    public get distanceToPlayer(): number {
        return this.distanceTo(this.scene.player);
    }

    protected getClosestEntityInRange(range: number): Entity | null {
        const sortedEntityDistances = this.getEntitiesInRange(range).sort(
            (a, b ) => { return a.distance - b.distance; }
        );

        if (sortedEntityDistances[0]) {
            return sortedEntityDistances[0].target;
        } else {
            return null;
        }
    }

    protected getEntitiesInRange(range: number): EntityDistance[] {
        const entitiesInRange: EntityDistance[] = [];

        this.scene.rootNode.forEachChild(gameObject => {
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

        this.scene.rootNode.forEachChild(gameObject => {
            if (gameObject instanceof Entity && gameObject !== this) {
                const distance = this.distanceTo(gameObject);
                entitiesInRange.push({source: this, target: gameObject, distance});
            }
        });

        entitiesInRange.sort((a, b ) => { return a.distance - b.distance; });

        return entitiesInRange[0].target;
    }

    // TODO Merge with getBounds from SceneNode?
    public getOldBounds(margin = 0): Bounds {
        const width = this.getWidth() + (margin * 2);
        const height = this.getHeight() + (margin * 2);
        const minX = this.getX() - (this.getWidth() / 2) - margin;
        const minY = this.getY() - -this.getHeight() + margin;
        return { x: minX, y: minY, width, height };
    }

    /**
     * Checks wether this entity is currently colliding with the provided named trigger.
     * @param triggerName the trigger name to check against.
     */
    protected isCollidingWithTrigger(triggerName: string): boolean {
        const collisions = this.scene.world.getTriggerCollisions(this);

        if (collisions.length === 0) {
            return false;
        }

        return collisions.findIndex(o => o.name === triggerName) > -1;
    }
}
