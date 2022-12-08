import { CACHE_NAME } from "../shared/constants";

export class Cache extends Object {

    #name: string;
    #cache?: globalThis.Cache;

    public get name(): string {
        return this.#name;
    }

    public constructor(name: string = CACHE_NAME) {
        super();
        this.#name = name;
    }

    public async open(): Promise<void> {
        this.#cache = await caches.open(this.#name);
    }

    public async add(...resources: string[]): Promise<void> {
        return this.addAll(resources);
    }

    public async addAll(resources: string[]): Promise<void> {
        if (this.#cache === undefined) {
            await this.open();
        }
        return this.#cache!.addAll(resources);
    }

}
