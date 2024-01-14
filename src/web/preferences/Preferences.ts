import { AudioPreferencesStore } from "../audio/AudioPreferencesStore";
//import { Signal } from "../Signal";

export class Preferences {

    static readonly #INSTANCE: Preferences = new Preferences();
    public static getInstance(): Preferences {
        return Preferences.#INSTANCE;
    }

    readonly #audio: AudioPreferencesStore;

    public constructor() {
        this.#audio = new AudioPreferencesStore();
    }

    public get audio(): AudioPreferencesStore {
        return this.#audio;
    }

}
