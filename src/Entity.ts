import { GameObject, Game } from "./game";


export abstract class Entity implements GameObject {
    constructor(public game: Game, public x: number, public y: number) {}

    async load(): Promise<void> {}

    abstract draw(ctx: CanvasRenderingContext2D): void;

    abstract update(dt: number): void;

}
