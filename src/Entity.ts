import { GameObject, Game } from "./game";


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

    protected getEntitiesInRange(range: number): Entity[] {
        const entitiesInRange: Entity[] = []
        this.game.gameObjects.forEach(gameObject => {
            if (gameObject instanceof Entity && this.distanceTo(gameObject) < range) {
                entitiesInRange.push(gameObject);
            }
        });
        return entitiesInRange;
    }

}
