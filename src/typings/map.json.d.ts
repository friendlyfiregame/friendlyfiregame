declare module "*/level.json" {
    export type PropertyType<T extends string> =
        T extends "string" ? string :
        T extends "int" ? number :
        unknown;

    export interface MapObjectPropertyJSON<T extends string> {
        name: string;
        type: T;
        value: PropertyType<T>;
    }

    export interface MapObjectJSON {
        name: string;
        type: string;
        x: number;
        y: number;
        width: number;
        height: number;
        properties?: MapObjectPropertyJSON[];
    }

    export interface MapLayerJSON {
        name: string;
    }

    export interface MapTileLayerJSON extends MapLayerJSON {
        type: "tilelayer";
    }

    export interface MapObjectLayerJSON extends MapLayerJSON {
        type: "objectgroup";
        objects: MapObjectJSON[];
    }

    export interface MapInfoJSON {
        layers: Array<MapTileLayerJSON | MapObjectLayerJSON>;
        width: number;
        height: number;
        tilewidth: number;
        tileheight: number;
    }

    export type MapLayerJSONType<T extends string> =
        T extends "tilelayer" ? MapTileLayerJSON :
        T extends "objectgroup" ? MapObjectLayerJSON :
        MapLayerJSON;

    const value: MapInfoJSON;
    export default value;
}
