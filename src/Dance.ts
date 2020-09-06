import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { ControllerEvent } from "./input/ControllerEvent";
import { ControllerManager } from "./input/ControllerManager";
import { ControllerSpriteMap } from "./input/ControllerFamily";
import { GameScene } from "./scenes/GameScene";
import { RenderingLayer, RenderingType } from "./Renderer";
import { Sound } from "./Sound";
import { ValueCurve, valueCurves } from "./Particles";

export class Dance {
    @asset("sounds/dancing/success.mp3")
    private static successSound: Sound;

    @asset("sounds/dancing/fail.mp3")
    private static failSound: Sound;

    @asset("music/raindance.ogg")
    private static raindance_music: Sound;

    @asset("music/dancing_queen.ogg")
    private static treedance_music: Sound;

    @asset("sprites/dancing_ui_bar.png")
    private static bar: HTMLImageElement;

    @asset("sprites/dancing_ui_indicator.png")
    private static indicator: HTMLImageElement;

    @asset("sprites/dancing_ui_keys.aseprite.json")
    private static keys: Aseprite;

    /** When the dance was created and visible to the player for the first time */
    private openTime!: number;
    /** Time of the first note, depends on openTime and warmupBeats */
    private startTime!: number;
    /** Progress time relative to startTime. So starts out negative during warmup. */
    private progress = 0;
    private duration: number;
    private currentKey = "";
    private currentDistanceToIdealTime = 0;
    private allKeys = ["1", "2"];
    private keys: string[];
    private alphaCurve: ValueCurve;
    private mistakes = 0;
    private lastMistake = 0;
    private lastSuccess = 0;
    private performance: Record<string, boolean>[] = [];
    private currentIndex = 0;
    private success = false;

    constructor(
        private scene: GameScene,
        private x: number,
        private y: number,
        private bpm = 128,
        keys = "", // can contain "1" or "2" for single keys, or "3" for both at once
        private warmupBeats = 8,
        private allowedMistakes = 3,
        private timeTolerance = 0.75,
        private readonly withMusic = true,
        private readonly musicIndex = 1 // 0 tree-dance, 1 for raindance
    ){
        this.duration = keys.length;
        this.keys = [];
        this.performance = [];

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.keys[i] = key === " " ? "" : key === "3" ? "12" : key;
            this.performance[i] = {};
        }

        this.begin();
        this.alphaCurve = valueCurves.cos(0.15);
    }

    public wasSuccessful(): boolean {
        return this.success;
    }

    public hasStarted(): boolean {
        return this.progress > 0;
    }

    public getTimeSinceLastMistake(): number {
        return this.progress - this.lastMistake;
    }

    public getTimeSinceLastSuccess(): number {
        return this.progress - this.lastSuccess;
    }

    private begin(): void {
        this.openTime = this.scene.gameTime;
        this.startTime = this.openTime + this.warmupBeats / this.bpm * 60;
        this.currentKey = "";
        this.currentDistanceToIdealTime = 0;
        this.mistakes = 0;
        this.lastMistake = -Infinity;
        this.lastSuccess = -Infinity;
        this.currentIndex = 0;
        this.performance = this.performance.map(() => ({}));
        this.success = false;
        Dance.raindance_music.stop();
        Dance.raindance_music.setVolume(0);
        Dance.treedance_music.stop();
        Dance.treedance_music.setVolume(0);
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    // Called by parent
    public handleButtonDown(e: ControllerEvent): void {
        if (!e.repeat && this.hasStarted()) {
            const key = e.isPlayerDance1 ? "1" : "2";
            if (this.allKeys.indexOf(key) >= 0) {
                if (this.currentKey.includes(key)) {
                    if (this.currentDistanceToIdealTime <= this.timeTolerance) {
                        this.keySuccess(key);
                        return;
                    }
                }

                const nxt = this.currentIndex + 1;

                if (this.keys[nxt] && this.keys[nxt].includes(key)) {
                    if (this.progress - (nxt + 0.5) < this.timeTolerance) {
                        this.keySuccess(key, nxt);
                        return;
                    }
                }

                this.keyFailure(key);
            }
        }
    }

    private keySuccess(key: string, index = this.currentIndex): void {
        for (const char of key) {
            if (index === this.currentIndex) {
                this.currentKey = this.currentKey.replace(char, "");
            }

            this.performance[index][char] = true;
        }
        if (index === this.currentIndex && this.currentKey.length === 0 || this.keys[index].length === 0) {
            this.lastSuccess = this.progress;
            Dance.successSound.stop();
        }
    }

    private keyFailure(key: string): void {
        if (!this.currentKey.includes(key)) {
            this.registerMistake();
            Dance.failSound.play();
        }
    }

    private keyMissed(key: string): void {
        if (this.performance[this.currentIndex]) {
            for (const char of key) {
                this.performance[this.currentIndex][char] = false;
            }
        }

        this.registerMistake();
    }

    private registerMistake(): void {
        this.mistakes++;
        this.lastMistake = this.progress;
        Dance.failSound.play();

        if (this.mistakes > this.allowedMistakes) {
            this.loseGame();
        }
    }

    private loseGame(): void {
        // Simply reset for now
        this.begin();
    }

    public update(): boolean {
        const time = this.scene.gameTime - this.startTime;
        this.progress = time * this.bpm / 60;
        const prevIndex = this.currentIndex;
        this.currentIndex = Math.floor(this.progress);
        this.updateMusic();

        // Next key?
        if (this.currentIndex > prevIndex) {
            // Missed last one?
            if (this.currentKey.length > 0) {
                this.keyMissed(this.currentKey);
                this.currentKey = "";
                return false;
            }

            // Proceed
            this.currentKey = this.keys[this.currentIndex] || "";

            for (const char of this.currentKey) {
                if (this.performance[this.currentIndex] && this.performance[this.currentIndex][char]) {
                    this.currentKey = this.currentKey.replace(char, "");
                }
            }
        }

        if (this.progress >= this.duration) {
            // Done! Success! Yeah!
            this.success = true;
            this.resetMusic();
            return true;
        }

        if (this.currentKey) {
            this.currentDistanceToIdealTime = Math.abs(this.progress - (this.currentIndex + 0.5));
        } else {
            this.currentDistanceToIdealTime = 0;
        }

        return false;
    }

    private updateMusic(): void {
        if (!this.withMusic) {
            return;
        }

        if (this.progress < 0 && !Dance.raindance_music.isPlaying()) {
            const fade = -this.progress / this.warmupBeats;
            this.scene.fadeActiveBackgroundTrack(fade);
        } else {
            // own music paused
            if (this.musicIndex === 0 && !Dance.treedance_music.isPlaying()) {
                Dance.treedance_music.setVolume(0.8);
                Dance.treedance_music.play();
                GameScene.bgm1.setVolume(0);
                GameScene.bgm2.setVolume(0);
            }

            if (this.musicIndex === 1 && !Dance.raindance_music.isPlaying()) {
                Dance.raindance_music.setVolume(0.8);
                Dance.raindance_music.play();
                GameScene.bgm1.setVolume(0);
                GameScene.bgm2.setVolume(0);
            }
        }
    }

    public resetMusic(): void {
        Dance.raindance_music.stop();
        Dance.treedance_music.stop();
        this.scene.resetMusicVolumes();
    }

    public drawDance(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.draw(ctx, {
            type: RenderingType.DANCE,
            layer: RenderingLayer.UI,
            dance: this
        });
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const controller: ControllerSpriteMap = ControllerManager.getInstance().controllerSprite;
        ctx.save();
        ctx.translate(this.x, -this.y);

        // Key Bar
        const w = 100;
        const h = 18;
        const w2 = w / 2;
        const h2 = h / 2;

        ctx.drawImage(Dance.bar, Dance.bar.width / -2, 1 + Dance.bar.height / -2);

        // Feedback
        if (this.progress - this.lastMistake < 1) {
            ctx.fillStyle = "red";
            ctx.globalAlpha = (1 - this.progress + this.lastMistake) * 0.6;
            ctx.fillRect(-w2 + 2, -h2 + 1, w - 4, h);
        }

        if (this.progress - this.lastSuccess < 1) {
            ctx.fillStyle = "green";
            ctx.globalAlpha = (1 - this.progress + this.lastSuccess) * 0.1;
            ctx.fillRect(-w2 + 2, -h2 + 1, w - 4, h);
        }

        // Upcoming keys
        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        const sweetX = w2 - 16;
        const y1 = -8;
        const y2 = 1;
        ctx.fillStyle = "black";

        for (let i = Math.floor(this.progress) - 2; i < this.progress + 8; i++) {
            const keys = this.keys[i];

            if (keys) {
                const diff = i - this.progress;
                const x = sweetX - diff * 20 - 6;
                const xp = (x - (-w2)) / w;
                const alpha = this.alphaCurve.get(xp);
                ctx.globalAlpha = alpha;

                if (keys.includes("1")) {
                    ctx.strokeStyle = "#ff8010";

                    if (this.performance[i]["1"] != null) {
                        ctx.fillStyle = this.performance[i]["1"] ? "#70F070" : "#F06060";
                        ctx.fillRect(x - 4, y1, 9, 9);
                    } else {
                        Dance.keys.drawTag(
                            ctx,
                            `${controller}-dance1`,
                            x + Dance.keys.width / -2, y1
                        );
                    }
                }

                if (keys.includes("2")) {
                    ctx.strokeStyle = "blue";

                    if (this.performance[i]["2"] != null) {
                        ctx.fillStyle = this.performance[i]["2"] ? "#70F070" : "#F06060";
                        ctx.fillRect(x - 4, y2, 9, 9);
                    } else {
                        Dance.keys.drawTag(
                            ctx,
                            `${controller}-dance2`,
                            x + Dance.keys.width / -2, y2
                        );
                    }
                }
            }
        }

        // Sweet spot
        ctx.globalAlpha = 1;
        ctx.drawImage(Dance.indicator, sweetX - 8, 1 + Dance.indicator.height / -2);
        ctx.drawImage(Dance.indicator, sweetX + 4, 1 + Dance.indicator.height / -2);
        ctx.restore();
    }
}
