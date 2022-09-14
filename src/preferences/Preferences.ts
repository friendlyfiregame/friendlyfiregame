import { AudioPreferencesStore } from "../audio/AudioPreferencesStore";
//import { Signal } from "../Signal";

export class Preferences {

    static #INSTANCE: Preferences = new Preferences();
    public static getInstance(): Preferences {
        return Preferences.#INSTANCE;
    }

    #audio: AudioPreferencesStore;

    constructor() {
        this.#audio = new AudioPreferencesStore();
    }

    public get audio(): AudioPreferencesStore {
        return this.#audio;
    }

}
