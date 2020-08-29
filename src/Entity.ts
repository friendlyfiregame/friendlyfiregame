import { Animator } from './Animator';
import { GameObject, GameScene } from './scenes/GameScene';
import { GameObjectProperties } from './MapInfo';
import { Point } from './geometry/Point';
import { RenderingLayer, RenderingType } from './Renderer';
import { Size } from './geometry/Size';

export interface EntityDistance {
    source: Entity;
    target: Entity;
    distance: number;
}

export type Bounds = {
    position: Point;
    size: Size;
}

type EntityConstructor = new (scene: GameScene, position: Point, properties: GameObjectProperties) => Entity;

const entities = new Map<string, EntityConstructor>();

export function entity(name: string): (target: EntityConstructor) => void {
    return (type: EntityConstructor) => {
        entities.set(name, type);
    };
}

export function createEntity(
    name: string, scene: GameScene, position: Point, properties: GameObjectProperties
): Entity {
    const constructor = entities.get(name);

    if (!constructor) {
        throw new Error("Entity not found: " + name);
    }

    return new constructor(scene, position, properties);
}

export abstract class Entity implements GameObject {
    protected timeAlive = 0;
    protected animator = new Animator(this);

    constructor(
        public scene: GameScene,
        public position: Point,
        public size: Size,
        public isTrigger = true
    ) {}

    abstract draw(ctx: CanvasRenderingContext2D): void;

    public update(dt: number): void {
        this.timeAlive += dt;
    }

    public distanceTo(entity: Entity): number {
        const a = this.position.x - entity.position.x;
        const b = this.position.y - entity.position.y;

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

    protected getClosestEntity(entities: Entity[]): Entity {
        const entitiesInRange: EntityDistance[] = []
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
        const position = new Point(
            this.position.x - (this.size.width / 2) - margin,
            this.position.y - -this.size.height + margin
        );
        const size = new Size(
            this.size.width + (margin * 2),
            this.size.height + (margin * 2)
        );

        return { position, size };
    }

    protected drawBounds(): void {
        this.scene.renderer.add({
            type: RenderingType.RECT,
            layer: RenderingLayer.DEBUG,
            position: new Point(this.getBounds().position.x, -this.getBounds().position.y),
            lineColor: "red",
            size: this.getBounds().size
        })
    }

    /**
     * Checks wether this entity is currently colliding with the provided named trigger.
     * @param triggerName the trigger name to check against.
     */
    protected isCollidingWithTrigger (triggerName: string): boolean {
        const collisions = this.scene.world.getTriggerCollisions(this);

        if (collisions.length === 0) {
            return false;
        }

        return collisions.findIndex(o => o.name === triggerName) > -1;
    }

    public remove(): void {
        this.scene.removeGameObject(this);
    }
}
