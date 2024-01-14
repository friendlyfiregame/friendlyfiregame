import { Animator } from "./Animator";
import { GameObject, GameScene } from "./scenes/GameScene";
import { GameObjectProperties } from "./MapInfo";
import { RenderingLayer, RenderingType } from "./Renderer";

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

export abstract class Entity implements GameObject {
    protected timeAlive = 0;
    protected animator = new Animator(this);

    public constructor(
        public scene: GameScene,
        public x: number,
        public y: number,
        public width = 0,
        public height = 0,
        public isTrigger = true
    ) {}

    public abstract draw(ctx: CanvasRenderingContext2D): void;

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

    protected drawBounds(): void {
        this.scene.renderer.add({
            type: RenderingType.RECT,
            layer: RenderingLayer.DEBUG,
            position: {
                x: this.getBounds().x,
                y: -this.getBounds().y
            },
            lineColor: "red",
            dimension: {
               width: this.getBounds().width,
               height: this.getBounds().height
            }
        });
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

    public remove(): void {
        this.scene.removeGameObject(this);
    }
}
