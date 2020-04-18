import { GameObject, Game } from "./game";

export interface EntityDistance {
    source: Entity;
    target: Entity;
    distance: number;
}

export abstract class Entity implements GameObject {
    constructor(
        public game: Game,
        public x: number,
        public y: number,
        public width = 0,
        public height = 0
    ) {}

    async load(): Promise<void> {
        // set width/height based on loaded sprite?
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;

    abstract update(dt: number): void;

    protected distanceTo(entity: Entity) {
        const a = this.x - entity.x;
        const b = this.y - entity.y;
        return Math.sqrt(a*a + b*b);
    }

    protected getClosestEntityInRange(range: number): Entity | null {
        const sortedEntityDistances = this.getEntitiesInRange(range).sort((a, b ) => { return a.distance - b.distance; });
        if (sortedEntityDistances[0]) {
            return sortedEntityDistances[0].target;
        } else {
            return null;
        }
    }

    protected getEntitiesInRange(range: number): EntityDistance[] {
        const entitiesInRange: EntityDistance[] = []
        this.game.gameObjects.forEach(gameObject => {
            if (gameObject instanceof Entity && gameObject !== this) {
                const distance = this.distanceTo(gameObject);
                if (distance < range) {
                    entitiesInRange.push({source: this, target: gameObject, distance});
                }
            }
        });
        return entitiesInRange;
    }

}
