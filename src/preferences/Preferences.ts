import { AudioPreferencesStore } from "../audio/AudioPreferencesStore";
import { clamp } from "../util";
//import { Signal } from "../Signal";

export class Preferences {

    static #INSTANCE: Preferences = new Preferences();
    public static getInstance(): Preferences {
        return Preferences.#INSTANCE;
    }

    #audio: AudioPreferencesStore;

    constructor() {
        this.#audio = {
            getMusicGain: async () => Promise.resolve(clamp((Number(window.localStorage.getItem("audio.music.gain")) || 1), 0, 1)),
            setMusicGain: async(value: number) => { window.localStorage.setItem("audio.music.gain", String(clamp(value, 1, 0))); },
            getSfxGain: async () => Promise.resolve(clamp((Number(window.localStorage.getItem("audio.sfx.gain") || 1)), 0, 1)),
            setSfxGain: async(value: number) => { window.localStorage.setItem("audio.sfx.gain", String(clamp(value, 1, 0))); },
        };
    }

    public get audio(): AudioPreferencesStore {
        return this.#audio;
    }

}
