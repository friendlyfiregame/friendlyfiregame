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

    public async open(): Promise<this> {
        if (this.#cache === undefined) {
            this.#cache = await caches.open(this.#name);
        }
        return this;
    }

    public async put(request: Request, response: Response): Promise<void> {
        await this.open();
        return this.#cache!.put(request, response);
    }

    public async putAll(resources: string[]): Promise<void> {
        await this.open();
        return this.#cache!.addAll(resources);
    }

    public async deleteAll(): Promise<void> {
        await this.open();
        await (await this.#cache!.keys()).reduce(async (previousValue, currentValue, currentIndex, array): Promise<boolean> => {
            await previousValue;
            return this.#cache!.delete(currentValue.url);
        }, Promise.resolve(true));
    }

    public override toString(): string {
        return `Cache{name=${name}}`;
    }

}
