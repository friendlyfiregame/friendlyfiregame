import { clamp } from "./util";
import { ControllerManager } from "./input/ControllerManager";

// Get cross-browser AudioContext (Safari still uses webkitAudioContext…)
const AudioContext = window.AudioContext ?? (window as any).webkitAudioContext as AudioContext;

let audioContext: AudioContext | null = null;
let globalGainNode: GainNode | null = null;

export function getAudioContext(): AudioContext {
    const controllerManager = ControllerManager.getInstance();
    if (audioContext == null) {
        audioContext = new AudioContext();

        // When audio context is suspended then try to wake it up on next key or pointer press
        if (audioContext.state === "suspended") {
            const resume = () => {
                audioContext?.resume();
            };
            controllerManager.onButtonDown.connect(resume);
            document.addEventListener("pointerdown", resume);
            audioContext.addEventListener("statechange", () => {
                if (audioContext?.state === "running") {
                    controllerManager.onButtonDown.disconnect(resume);
                    document.removeEventListener("pointerdown", resume);
                }
            });
        }
    }
    return audioContext;
}

export function getGlobalGainNode(): GainNode {
    if (globalGainNode == null) {
        const audioContext = getAudioContext();
        globalGainNode = audioContext.createGain();
        globalGainNode.connect(audioContext.destination);
    }
    return globalGainNode;
}

export class Sound {
    private readonly gainNode: GainNode;
    private source: AudioBufferSourceNode | null = null;
    private loop: boolean = false;

    private constructor(private readonly buffer: AudioBuffer) {
        this.gainNode = getAudioContext().createGain();
        this.gainNode.connect(getGlobalGainNode());
    }

    public static async load(url: string): Promise<Sound> {
        const arrayBuffer = await (await fetch(url)).arrayBuffer()
        return new Promise((resolve, reject) => {
            getAudioContext().decodeAudioData(arrayBuffer,
                buffer => resolve(new Sound(buffer)),
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
