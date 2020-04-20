import { Game } from './game';
import { valueCurves, ValueCurve } from './Particles';
import { Sound } from './Sound';

export class Dance {
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
    private static successSound: Sound;
    private static failSound: Sound;

    constructor(
        private game: Game,
        private x: number,
        private y: number,
        private bpm = 128,
        keys = "", // can contain "1" or "2" for single keys, or "3" for both at once
        private warmupBeats = 2,
        private allowedMistakes = 3,
        private timeTolerance = 0.75,
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

    public static async load(): Promise<void> {
        console.log('loading');
        this.successSound = new Sound("sounds/dancing/success.mp3");
        this.failSound = new Sound("sounds/dancing/fail.mp3");
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

    private begin() {
        this.openTime = this.game.gameTime;
        this.startTime = this.openTime + this.warmupBeats;
        this.currentKey = "";
        this.currentDistanceToIdealTime = 0;
        this.mistakes = 0;
        this.lastMistake = -Infinity;
        this.lastSuccess = -Infinity;
        this.currentIndex = 0;
        this.performance = this.performance.map(() => ({}));
        this.success = false;
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // Called by parent
    public handleKeyDown(e: KeyboardEvent) {
        if (!e.repeat && this.hasStarted()) {
            const key = e.key.substr(-1).toLowerCase();
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
                        return
                    }
                }
                this.keyFailure(key);
            }
        }
    }

    private keySuccess(key: string, index = this.currentIndex) {
        for (let char of key) {
            if (index == this.currentIndex) {
                this.currentKey = this.currentKey.replace(char, "");
            }
            this.performance[index][char] = true;
        }
        if (index === this.currentIndex && this.currentKey.length === 0 || this.keys[index].length === 0) {
            this.lastSuccess = this.progress;
            Dance.successSound.stop();
            Dance.successSound.play();
        }
    }

    private keyFailure(key: string) {
        if (!this.currentKey.includes(key)) {
            this.registerMistake();
            Dance.failSound.play();
        }
    }

    private keyMissed(key: string) {
        if (this.performance[this.currentIndex]) {
            for (let char of key) {
                this.performance[this.currentIndex][char] = false;
            }
        }
        this.registerMistake()
    }

    private registerMistake() {
        this.mistakes++;
        this.lastMistake = this.progress;
        Dance.failSound.play();
        if (this.mistakes > this.allowedMistakes) {
            this.loseGame();
        }
    }

    private loseGame() {
        // Simply reset, for now
        this.begin();
    }



    public update(dt: number): boolean {
        const time = this.game.gameTime - this.startTime;
        this.progress = time * this.bpm / 60;
        const prevIndex = this.currentIndex;
        this.currentIndex = Math.floor(this.progress);
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
            for (let char of this.currentKey) {
                if (this.performance[this.currentIndex] && this.performance[this.currentIndex][char]) {
                    this.currentKey = this.currentKey.replace(char, "");
                }
            }
        }
        if (this.progress >= this.duration) {
            // Done! Success! Yeah!
            this.success = true;
            return true;
        }
        if (this.currentKey) {
            this.currentDistanceToIdealTime = Math.abs(this.progress - (this.currentIndex + 0.5));
        } else {
            this.currentDistanceToIdealTime = 0;
        }
        return false;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, -this.y);
        // Key Bar
        const w = 100, h = 18, w2 = w / 2, h2 = h / 2;
        ctx.fillStyle = "#999";
        ctx.fillRect(-w2 + 2, -h2 + 1, w - 4, h);
        ctx.fillStyle = "white";
        ctx.fillRect(-w2, -h2, w, 1);
        ctx.fillRect(-w2, h2 + 1, w, 1);
        // Feedback
        if (this.progress - this.lastMistake < 1) {
            ctx.fillStyle = "red";
            ctx.globalAlpha = (1 - this.progress + this.lastMistake) * 0.5;
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
        const sweetX = w2 - 16, y1 = -8, y2 = 1;
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
                        ctx.fillRect(x - 5, y1, 9, 9);
                    }
                    ctx.strokeRect(x - 5, y1, 9, 9);
                    this.game.mainFont.drawText(ctx, "1", x - 2, y1 + 1, "black");
                }
                if (keys.includes("2")) {
                    ctx.strokeStyle = "blue";
                    if (this.performance[i]["2"] != null) {
                        ctx.fillStyle = this.performance[i]["2"] ? "#70F070" : "#F06060";
                        ctx.fillRect(x - 5, y2, 9, 9);
                    }
                    ctx.strokeRect(x - 5, y2, 9, 9);
                    this.game.mainFont.drawText(ctx, "2", x - 3, y2 + 1, "black");
                }
            }
        }
        // Sweet-spot
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#2080bf";
        ctx.fillRect(sweetX - 6, -h2 + 1, 1, h);
        ctx.fillRect(sweetX + 6, -h2 + 1, 1, h);
        ctx.restore();
    }
}
