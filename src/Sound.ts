export class Sound {
    private readonly audio: HTMLAudioElement;

    public constructor(src: string) {
        this.audio = new Audio(`assets/${src}`);
    }

    public isPlaying(): boolean {
        return !!(this.audio.currentTime > 0 && !this.audio.paused && !this.audio.ended && this.audio.readyState > 2)
    }

    public stop(): void {
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    public play(): void {
        this.audio.play();
    }

    public setLoop(loop: boolean): void {
        this.audio.loop = loop;
    }

    public trigger(): void {
        if (!this.isPlaying()) {
            this.play();
        }
    }

    public setVolume(volume: number): void {
        if (volume < 0) {
            this.audio.volume = 0;
        } else {
            this.audio.volume = volume;
        }
    }
}
