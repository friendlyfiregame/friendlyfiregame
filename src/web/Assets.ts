import { type AppInfoJSON } from "./AppInfo";
import { Aseprite } from "./Aseprite";
import { Sound } from "./audio/Sound";
import { SoundChannel } from "./audio/SoundChannel";
import { BitmapFont } from "./BitmapFont";
import { loadImage } from "./graphics";

const assets = new Map<string, unknown>();

export interface AssetOptions<A> {
    map?: (asset: A) => unknown;
}

class AssetRequest<
        S extends string | string[] = string | string[],
        A extends (S extends string ? unknown : unknown[]) = (S extends string ? unknown : unknown[])> {
    public constructor(
        private readonly target: Record<string | symbol, unknown>,
        private readonly propertyKey: string | symbol,
        public readonly src: S,
        private readonly options: AssetOptions<A>
    ) {}

    public resolve(asset: A): void {
        this.target[this.propertyKey] = this.options.map ? this.options.map(asset) : asset;
    }
}

const assetRequests: AssetRequest[] = [];

export function asset<A>(src: string | string[], options: AssetOptions<A> = {}): PropertyDecorator {
    return (target: object, propertyKey: string | symbol): void => {
        assetRequests.push(new AssetRequest(target as Record<string, unknown>, propertyKey, src, options) as AssetRequest);
    };
}

export class Assets {
    private async loadAsset(src: string): Promise<unknown> {
        let asset = assets.get(src);

        if (asset == null) {
            if (src.endsWith(".aseprite.json")) {
                asset = await Aseprite.load(`assets/${src}`);
            } else if (src.endsWith(".font.json")) {
                asset = await BitmapFont.load(`assets/${src}`);
            } else if (src.endsWith(".png")) {
                asset = await loadImage(src);
            } else if (src.endsWith(".mp3") || src.endsWith(".ogg")) {
                const soundChannel = src.startsWith("music") ? SoundChannel.MUSIC : SoundChannel.SFX;
                asset = await Sound.load(`assets/${src}`, soundChannel);
            } else if (src === "appinfo.json") {
                asset = await (await fetch("appinfo.json")).json() as AppInfoJSON;
            } else {
                throw new Error(`Unknown asset format: ${src}`);
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
