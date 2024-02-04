export interface GameObject {
    activate?(): void;
    render?(): void;
    update(dt: number): void;
}

export interface CollidableGameObject extends GameObject {
    collidesWith(x: number, y: number): number;
}

export function isCollidableGameObject(object: GameObject): object is CollidableGameObject  {
    return typeof (object as CollidableGameObject).collidesWith === "function";
}
