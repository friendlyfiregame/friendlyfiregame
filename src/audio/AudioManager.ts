import { getAudioContext } from "./AudioContext";
import { AudioPreferencesStore } from "./AudioPreferencesStore";

import { Preferences } from "../preferences/Preferences";

import { clamp } from "../util";

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
        this.#musicGainNode.gain.value = audioPreferencesStore.music.gain;
        this.#musicGainNode.connect(audioContext.destination);
        this.#sfxGainNode = audioContext.createGain();
        this.#sfxGainNode.gain.value = audioPreferencesStore.sfx.gain;
        this.#sfxGainNode.connect(audioContext.destination);
    }

    public get musicGainNode(): GainNode {
        return this.#musicGainNode;
    }

    public get sfxGainNode(): GainNode {
        return this.#sfxGainNode;
    }

    public get musicGain(): number {
        return this.#musicGainNode.gain.value;
    }

    public set musicGain(value: number) {
        value = clamp(value, 0, 1);
        if (this.#musicGainNode.gain.value !== value) {
            this.#audioPreferencesStore.music.gain = value;
            this.#musicGainNode.gain.value = value;
        }
    }

    public get sfxGain(): number {
        return this.#sfxGainNode.gain.value;
    }

    public set sfxGain(value: number) {
        value = clamp(value, 0, 1);
        if (this.#sfxGainNode.gain.value !== value) {
            this.#audioPreferencesStore.sfx.gain = value;
            this.#sfxGainNode.gain.value = value;
        }
    }

}
