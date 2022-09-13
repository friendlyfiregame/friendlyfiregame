import { clamp } from "../util";

import { SoundChannel } from "./SoundChannel";
import { getAudioContext } from "./AudioContext";
import { AudioManager } from "./AudioManager";

export class Sound {
    #audioManager: AudioManager;
    private readonly gainNode: GainNode;
    private source: AudioBufferSourceNode | null = null;
    private loop: boolean = false;

    private constructor(private readonly buffer: AudioBuffer, private readonly channel: SoundChannel) {
        this.#audioManager = AudioManager.getInstance();
        this.gainNode = getAudioContext().createGain();
        this.gainNode.connect(this.channel === SoundChannel.MUSIC ? this.audioManager.musicGainNode : this.audioManager.sfxGainNode);
    }

    public get audioManager(): AudioManager {
        return this.#audioManager;
    }

    public static async load(url: string, channel:  SoundChannel = SoundChannel.SFX): Promise<Sound> {
        const arrayBuffer = await (await fetch(url)).arrayBuffer();

        return new Promise((resolve, reject) => {
            getAudioContext().decodeAudioData(arrayBuffer,
                buffer => resolve(new Sound(buffer, channel)),
                error => reject(error)
            );
        });
    }

    public isPlaying(): boolean {
        return this.source != null;
    }

    public play(): void {
        if (!this.isPlaying()) {
            const source = getAudioContext().createBufferSource();
            source.buffer = this.buffer;
            source.loop = this.loop;
            source.connect(this.gainNode);

            source.addEventListener("ended", () => {
                if (this.source === source) {
                    this.source = null;
                }
            });

            this.source = source;
            source.start();
        }
    }

    public stop(): void {
        if (this.source) {
            try {
                this.source.stop();
            } catch (e) {
                // Ignored. Happens on Safari sometimes. Can't stop a sound which may not be really playing?
            }

            this.source = null;
        }
    }

    public setLoop(loop: boolean): void {
        this.loop = loop;

        if (this.source) {
            this.source.loop = loop;
        }
    }

    public setVolume(volume: number): void {
        const gain = this.gainNode.gain;
        gain.value = clamp(volume, gain.minValue, gain.maxValue);
    }
}
