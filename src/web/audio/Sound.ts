import { clamp } from "../util";
import { getAudioContext } from "./AudioContext";
import { AudioManager } from "./AudioManager";
import { SoundChannel } from "./SoundChannel";

export class Sound {
    readonly #audioManager: AudioManager;
    readonly #channel: SoundChannel;
    private readonly gainNode: GainNode;
    private source: AudioBufferSourceNode | null = null;
    private loop: boolean = false;

    private constructor(private readonly buffer: AudioBuffer, channel: SoundChannel) {
        this.#audioManager = AudioManager.getInstance();
        this.#channel = channel;
        this.gainNode = getAudioContext().createGain();
        let gainNode: GainNode;
        switch (this.#channel) {
            case SoundChannel.MUSIC:
                gainNode = this.audioManager.musicGainNode;
                break;
            case SoundChannel.SFX:
                gainNode = this.audioManager.sfxGainNode;
                break;
            default:
                throw new Error(`Unknown sound channel: ${channel}.`);
        }
        this.gainNode.connect(gainNode);
    }

    public get audioManager(): AudioManager {
        return this.#audioManager;
    }

    public static async load(url: string, channel:  SoundChannel = SoundChannel.SFX): Promise<Sound> {
        const arrayBuffer = await (await fetch(url)).arrayBuffer();
        const buffer = await getAudioContext().decodeAudioData(arrayBuffer);
        return new Sound(buffer, channel);
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
