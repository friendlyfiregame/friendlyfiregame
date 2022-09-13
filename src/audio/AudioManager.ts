import { getAudioContext } from "./AudioContext";

import { Preferences } from "../preferences/Preferences";


import { clamp } from "../util";

export interface AudioPreferencesStore {
    getMusicGain(): Promise<number>;
    setMusicGain(volume: number): Promise<void>;
    getSfxGain(): Promise<number>;
    setSfxGain(volume: number): Promise<void>;
}

export class AudioManager {

    static readonly #INSTANCE: AudioManager = new AudioManager(Preferences.getInstance().audio);
    public static getInstance(): AudioManager {
        return AudioManager.#INSTANCE;
    }

    #audioPreferencesStore: AudioPreferencesStore;

    #musicGainNode: GainNode;
    #sfxGainNode: GainNode;
    constructor(audioPreferencesStore: AudioPreferencesStore) {
        this.#audioPreferencesStore = audioPreferencesStore;
        const audioContext = getAudioContext();
        this.#musicGainNode = audioContext.createGain();
        this.#musicGainNode.connect(audioContext.destination);
        this.#sfxGainNode = audioContext.createGain();
        this.#sfxGainNode.connect(audioContext.destination);
    }

    public get musicGainNode(): GainNode {
        return this.#musicGainNode;
    }

    public get sfxGainNode(): GainNode {
        return this.#sfxGainNode;
    }

    async getMusicGain(): Promise<number> {
        return Promise.resolve(this.#musicGainNode.gain.value);
    }

    async setMusicGain(value: number): Promise<void> {
        this.#audioPreferencesStore.setMusicGain(clamp(value, 0, 1));
        AudioManager.getInstance().musicGainNode.gain.value = value;
    }

    async getSfxGain(): Promise<number> {
        return Promise.resolve(AudioManager.getInstance().sfxGainNode.gain.value);
    }

    async setSfxGain(value: number) {
        this.#audioPreferencesStore.setSfxGain(clamp(value, 0, 1));
        AudioManager.getInstance().sfxGainNode.gain.value = value;
    }
}
