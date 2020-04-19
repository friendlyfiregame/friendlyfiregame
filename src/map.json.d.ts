declare module "*/map.json" {
    export interface MapObjectJSON {
        name: string;
        x: number;
        y: number;
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
