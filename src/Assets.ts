import { AppInfoJSON } from 'appinfo.json';
import { Aseprite } from './Aseprite';
import { BitmapFont } from './BitmapFont';
import { loadImage } from './graphics';
import { Sound } from './Sound';

const assets = new Map<string, unknown>();

export interface AssetOptions {
    map?: (asset: any) => unknown;
}

class AssetRequest<
        S extends string | string[] = string | string[],
        A extends (S extends string ? unknown : unknown[]) = (S extends string ? unknown : unknown[])> {
    constructor(
        private readonly target: any,
        private readonly propertyKey: string | symbol,
        public readonly src: S,
        private readonly options: AssetOptions
    ) {}

    public resolve(asset: A): void {
        this.target[this.propertyKey] = this.options.map ? this.options.map(asset) : asset;
    }
}

const assetRequests: AssetRequest[] = [];

export function asset(src: string | string[], options: AssetOptions = {}): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        assetRequests.push(new AssetRequest(target, propertyKey, src, options));
    }
}

export class Assets {
    private async loadAsset(src: string): Promise<unknown> {
        let asset = assets.get(src);
        if (asset == null) {
            if (src.endsWith(".aseprite.json")) {
                asset = await Aseprite.load("assets/" + src);
            } else if (src.endsWith(".font.json")) {
                asset = await BitmapFont.load("assets/" + src);
            } else if (src.endsWith(".png")) {
                asset = await loadImage(src);
            } else if (src.endsWith(".mp3")) {
                asset = await Sound.load("assets/" + src);
            } else if (src.endsWith(".ogg")) {
                asset = await Sound.load("assets/" + src);
            } else if (src === "appinfo.json") {
                asset = await (await fetch("appinfo.json")).json() as AppInfoJSON
            } else {
                throw new Error("Unknown asset format: " + src);
            }
            assets.set(src, asset);
        }
        return asset;
    }

    public async load(onProgress?: (total: number, loaded: number) => void): Promise<void> {
        const total = assetRequests.length;
        let loaded = 0;
        if (onProgress) {
            onProgress(total, loaded);
        }
        let request;
        while ((request = assetRequests.pop()) != null) {
            if (typeof request.src === "string") {
                request.resolve(await this.loadAsset(request.src));
            } else {
                request.resolve(await Promise.all(request.src.map(src => this.loadAsset(src))));
            }
            loaded++;
            if (onProgress) {
                onProgress(total, loaded);
            }
        }
    }
}
