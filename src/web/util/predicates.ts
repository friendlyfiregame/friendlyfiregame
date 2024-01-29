import { type Entity } from "../Entity";
import { type Constructor } from "./types";

export function isInstanceOf<T extends object>(type: Constructor<T>): (instance: object) => instance is T {
    return (instance: object): instance is T => instance instanceof type;
}

export function isEntityName(name: string): (entity: Entity) => boolean {
    return (entity: Entity): boolean => entity.name === name;
}
