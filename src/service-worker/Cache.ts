import { CACHE_NAME } from "../shared/constants";

const DEFAULT_CACHE_NAME = `friendlyfire-${process.env["VERSION"] ?? CACHE_NAME}`;

export class Cache extends Object {

    readonly #name: string;
    #cache?: globalThis.Cache;

    public get name(): string {
        return this.#name;
    }

    public constructor(name: string = DEFAULT_CACHE_NAME) {
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
        return this.#cache?.put(request, response);
    }

    public async putAll(resources: string[]): Promise<void> {
        await this.open();
        return this.#cache?.addAll(resources);
    }

    public async deleteAll(): Promise<void> {
        await this.open();
        const keys = await this.#cache?.keys() ?? [];
        await Promise.all(keys.map((key) => this.#cache?.delete(key)));
    }

    public override toString(): string {
        return `Cache{name=${this.#name}}`;
    }

}
