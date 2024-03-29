import { clamp } from "../util";
import { DEFAULT_GAIN_VALUE, MAX_GAIN_VALUE, MIN_GAIN_VALUE } from "./constants";

const PREFERENCES_MUSIC_GAIN_KEY = "audio.music.gain";
const PREFERENCES_SFX_GAIN_KEY = "audio.sfx.gain";

class MusicPreferencesStore {
    public constructor() {
        if (window.localStorage.getItem(PREFERENCES_MUSIC_GAIN_KEY) == null) {
            this.gain = DEFAULT_GAIN_VALUE;
        }
    }

    public get gain(): number {
        return clamp((Number(window.localStorage.getItem(PREFERENCES_MUSIC_GAIN_KEY) ?? DEFAULT_GAIN_VALUE)), MIN_GAIN_VALUE, MAX_GAIN_VALUE);
    }

    public set gain(value: number) {
        window.localStorage.setItem(PREFERENCES_MUSIC_GAIN_KEY, value.toFixed(2));
    }
}

class SfxPreferencesStore {
    public constructor() {
        if (window.localStorage.getItem(PREFERENCES_SFX_GAIN_KEY) == null) {
            this.gain = DEFAULT_GAIN_VALUE;
        }
    }

    public get gain(): number {
        return clamp((Number(window.localStorage.getItem(PREFERENCES_SFX_GAIN_KEY) ?? DEFAULT_GAIN_VALUE)), MIN_GAIN_VALUE, MAX_GAIN_VALUE);
    }

    public set gain(value: number) {
        window.localStorage.setItem(PREFERENCES_SFX_GAIN_KEY, value.toFixed(2));
    }
}

export class AudioPreferencesStore {
    readonly #music: MusicPreferencesStore;
    readonly #sfx: SfxPreferencesStore;

    public get music(): MusicPreferencesStore {
        return this.#music;
    }

    public get sfx(): SfxPreferencesStore {
        return this.#sfx;
    }

    public constructor() {
        this.#music = new MusicPreferencesStore();
        this.#sfx = new SfxPreferencesStore();
    }
}
