import json, { MapLayerJSONType, MapObjectJSON } from "../../assets/maps/level.json";
import { Vector2Like } from "./graphics/Vector2";

export enum MapObjectType {
    ENTITY = "entity",
    TRIGGER = "trigger",
    POINTER = "pointer",
    GATE = "gate",
    BOUNDS = "bounds",
    SOUND = "sound"
}

export interface GameObjectProperties {
    direction?: "up" | "down" | "left" | "right";
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
    enterFadeTime?: number;
    enterSleepTime?: number;
    enterSound?: string;
    exitFadeTime?: number;
    exitSleepTime?: number;
    exitSound?: string;
    bgm?: string;
    disabled?: boolean;
    identifier?: string;
    intensity?: number;
    volume?: number;
    sound?: string;
    col?: number;
    row?: number;
    newGamePlus?: boolean;
}

export interface GameObjectInfo {
    x: number;
    y: number;
    name: string;
    type: string;
    width: number;
    height: number;
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
        return this.getLayer("objectgroup", "objects")?.objects.filter(object => type == null || object.type === type) ?? [];
    }

    public getPlayerStart(): Vector2Like {
        const mapHeight = MapInfo.getMapSize().height;
        const object = this.getObject("player");

        if (object) {
            return { x: object.x, y: mapHeight - object.y };
        } else {
            return { x: 0, y: 0 };
        }
    }

    public getGameObjectInfos(type: MapObjectType): GameObjectInfo[] {
        const mapHeight = MapInfo.getMapSize().height;
        return this.getObjects(type).map(object => ({
            name: object.name,
            x: object.x,
            y: mapHeight - object.y,
            type: object.type,
            width: object.width,
            height: object.height,
            properties: (object.properties ?? []).reduce((props, property) => {
                props[property.name] = property.value;
                return props;
            }, {} as Record<string, unknown>) as unknown as GameObjectProperties
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
        objects.forEach(o => { o.y = mapHeight - o.y; });

        return objects;
    }

    public static getMapSize(): { width: number, height: number } {
        return {
            width: json.width * json.tilewidth,
            height: json.height * json.tileheight
        };
    }
}
