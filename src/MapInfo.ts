import { Vector2 } from "./util";
import json, { MapLayerJSONType, MapObjectJSON } from "../assets/maps/map.json";

export class MapInfo {
    private getLayer<T extends string>(type: T, name: string): MapLayerJSONType<T> | null {
        return <MapLayerJSONType<T>>json.layers.find(layer => layer.type === type && layer.name === name) ?? null;
    }

    private getObject(name: string): MapObjectJSON | null {
        return this.getLayer("objectgroup", "objects")?.objects.find(object => object.name === name) ?? null;
    }

    public getPlayerStart(): Vector2 {
        const object = this.getObject("player_start");
        if (object) {
            return { x: object.x, y: object.y }
        } else {
            return { x: 0, y: 0 };
        }
    }

    public getMapSize(): { width: number, height: number } {
        return {
            width: json.width * json.tilewidth,
            height: json.height * json.tileheight
        }
    }
}
