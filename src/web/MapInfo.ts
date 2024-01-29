import { isObjectGroup } from "@kayahr/tiled";

import json from "../../assets/maps/level.map.json";

export interface GameObjectInfo {
    x: number;
    y: number;
    name: string;
    type: string;
    width: number;
    height: number;
    properties: Record<string, unknown>;
}

export class MapInfo {
    public getEntities(): GameObjectInfo[] {
        const mapHeight = json.height * json.tileheight;
        return json.layers.filter(isObjectGroup).flatMap(layer => layer.objects).map(object => ({
            name: object.name ?? "",
            x: object.x,
            y: mapHeight - object.y,
            type: object.type ?? "",
            width: object.width ?? 0,
            height: object.height ?? 0,
            properties: (object.properties ?? []).reduce((props, property) => {
                props[property.name] = property.value;
                return props;
            }, {} as Record<string, unknown>)
        }));
    }
}
