import { Direction } from './geometry/Direction';
import json, { MapLayerJSONType, MapObjectJSON } from '../assets/maps/level.json';
import { Point } from './geometry/Point';
import { Size } from './geometry/Size';

export enum MapObjectType {
    ENTITY = 'entity',
    TRIGGER = 'trigger',
    POINTER = 'pointer',
    GATE = 'gate',
    BOUNDS = 'bounds',
    SOUND = 'sound'
}

export interface GameObjectProperties {
    direction?: Direction,
    distance: number;
    velocity: number;
    target?: string;
    duration?: number;
    teleportY?: number;
    disableParticles?: boolean;
    setGlobalKey?: string;
    setGlobalVal?: string;
    setDialogEntity?: string;
    setDialogValue?: string;
    content?: string;
    bgm?: string;
    identifier?: string;
    intensity?: number;
    volume?: number;
    sound?: string;
    col?: number;
    row?: number;
}

export interface GameObjectInfo {
    position: Point,
    name: string;
    type: string;
    size: Size;
    properties: GameObjectProperties;
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

    public getPlayerStart(): Point {
        const mapHeight = MapInfo.getMapSize().height;
        const object = this.getObject("player");

        if (object) {
            return new Point(object.x, mapHeight - object.y);
        } else {
            return Point.getOrigin();
        }
    }

    public getGameObjectInfos(type: MapObjectType): GameObjectInfo[] {
        const mapHeight = MapInfo.getMapSize().height;

        return this.getObjects(type).map(object => ({
            name: object.name,
            position: new Point(object.x, mapHeight - object.y),
            type: object.type,
            size: new Size(object.width, object.height),
            properties: (object.properties ?? []).reduce((props, property) => {
                props[property.name] = property.value;
                return props;
            }, {})
        }));
    }

    public getEntities(): GameObjectInfo[] {
        return this.getGameObjectInfos(MapObjectType.ENTITY);
    }

    public getSounds(): GameObjectInfo[] {
        return this.getGameObjectInfos(MapObjectType.SOUND);
    }

    public getPointers(): GameObjectInfo[] {
        return this.getGameObjectInfos(MapObjectType.POINTER);
    }

    public getTriggerObjects(): GameObjectInfo[] {
        return this.getGameObjectInfos(MapObjectType.TRIGGER);
    }

    public getBoundObjects(): GameObjectInfo[] {
        return this.getGameObjectInfos(MapObjectType.BOUNDS);
    }

    public getGateObjects(): GameObjectInfo[] {
        return this.getGameObjectInfos(MapObjectType.GATE);
    }

    public static normalizeCoordinates(objects: MapObjectJSON[]): MapObjectJSON[] {
        const mapHeight = MapInfo.getMapSize().height;
        objects.forEach(o => o.y = mapHeight - o.y);

        return objects;
    }

    public static getMapSize(): Size {
        return new Size(json.width * json.tilewidth, json.height * json.tileheight);
    }
}
