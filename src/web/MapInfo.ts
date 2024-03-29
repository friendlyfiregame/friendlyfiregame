import { isObjectGroup, type MapObject } from "@kayahr/tiled";

import json from "../../assets/maps/level.map.json";

export enum MapObjectType {
    ENTITY = "entity",
    TRIGGER = "trigger",
    POINTER = "pointer",
    GATE = "gate",
    BOUNDS = "bounds",
    SOUND = "sound"
}
export interface GameObjectProperties {
    velocity?: number;
    target?: string;
    duration?: number;
    teleportY?: number;
    disableParticles?: boolean;
    setGlobalKey?: string;
    setGlobalVal?: string;
    setDialogEntity?: string;
    setDialogValue?: string;
    content?: string;
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
    private getObjects(type?: string): MapObject[] {
        const objects = json.layers.filter(isObjectGroup).flatMap(layer => layer.objects);
        if (type == null) {
            return objects;
        }
        return objects.filter(object =>object.type === type);
    }

    private getGameObjectInfos(type: MapObjectType): GameObjectInfo[] {
        const mapHeight = json.height * json.tileheight;
        return this.getObjects(type).map(object => ({
            name: object.name ?? "",
            x: object.x,
            y: mapHeight - object.y,
            type: object.type ?? "",
            width: object.width ?? 0,
            height: object.height ?? 0,
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
}
