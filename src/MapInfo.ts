import { Vector2 } from "./util";
import json, { MapLayerJSONType, MapObjectJSON } from "../assets/maps/map.json";

export interface GameObjectInfo {
    x: number;
    y: number;
    name: string;
}

export class MapInfo {
    private getLayer<T extends string>(type: T, name: string): MapLayerJSONType<T> | null {
        return <MapLayerJSONType<T>>json.layers.find(layer => layer.type === type && layer.name === name) ?? null;
    }

    private getObject(name: string): MapObjectJSON | null {
        return this.getLayer("objectgroup", "objects")?.objects.find(object => object.name === name) ?? null;
    }

    private getObjects(type?: string): MapObjectJSON[] {
        return this.getLayer("objectgroup", "objects")?.objects.filter(object => !type || object.type === type) ?? [];
    }

    public getPlayerStart(): Vector2 {
        const mapHeight = this.getMapSize().height;
        const object = this.getObject("player");
        if (object) {
            return { x: object.x, y: mapHeight - object.y }
        } else {
            return { x: 0, y: 0 };
        }
    }

    public getGameObjectInfos(): GameObjectInfo[] {
        const mapHeight = this.getMapSize().height;
        return this.getObjects().map(object => ({
            name: object.name,
            x: object.x,
            y: mapHeight - object.y
        }));
    }

    public getMapSize(): { width: number, height: number } {
        return {
            width: json.width * json.tilewidth,
            height: json.height * json.tileheight
        }
    }
}
