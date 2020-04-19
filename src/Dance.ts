import { Game } from './game';
import { valueCurves, ValueCurve } from './Particles';

export class Dance {
    /** When the dance was created and visible to the player for the first time */
    private openTime!: number;
    /** Time of the first noce, depends on openTime and warmupBeats */
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

    constructor(
        private game: Game,
        private x: number,
        private y: number,
        private bpm = 128,
        keys = "", // can contain "1" or "2" for single keys, or "3" for both at once
        private warmupBeats = 2,
        private allowedMistakes = 3,
        private timeTolerance = 0.5,
    ){
        this.duration = keys.length;
        this.keys = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.keys[i] = key === " " ? "" : key === "3" ? "12" : key;
        }
        this.begin();
        this.alphaCurve = valueCurves.cos(0.15);
    }

    public static async load(): Promise<void> {

    }

    private begin() {
        this.openTime = this.game.gameTime;
        this.startTime = this.openTime + this.warmupBeats;
        this.currentKey = "";
        this.currentDistanceToIdealTime = 0;
        this.mistakes = 0;
        this.lastMistake = -Infinity;
        this.lastSuccess = -Infinity;
    }

    // Called by parent
    public handleKeyDown(e: KeyboardEvent) {
        if (!e.repeat) {
            const key = e.code.substr(-1).toLowerCase();
            if (this.allKeys.indexOf(key) >= 0) {
                if (this.currentKey.includes(key)) {
                    if (this.currentDistanceToIdealTime <= this.timeTolerance) {
                        this.keySuccess(key);
                        return;
                    }
                }
                this.keyFailure(key);
            }
        }
    }

    private keySuccess(key: string) {
        this.lastSuccess = this.progress;
        this.currentKey = this.currentKey.replace(key, "");
        if (this.currentKey.length === 0) {
            // Finished key successfully
            // TODO play sound
            // TODO particles or something
        }
    }

    private keyFailure(key: string) {
        if (!this.currentKey.includes(key)) {
            this.registerMistake();
        }
    }

    private keyMissed(key: string) {
        this.registerMistake()
    }

    private registerMistake() {
        this.mistakes++;
        this.lastMistake = this.progress;
        if (this.mistakes > this.allowedMistakes) {
            this.loseGame();
        }
    }

    private loseGame() {
        // Simply reset, for now
        this.begin();
    }



    public update(dt: number) {
        const time = this.game.gameTime - this.startTime;
        const prevProgress = this.progress;
        this.progress = time * this.bpm / 60;
        // Next key?
        if (Math.floor(this.progress) > Math.floor(prevProgress)) {
            // Missed last one?
            if (this.currentKey.length > 0) {
                this.keyMissed(this.currentKey);
                this.currentKey = "";
                return;
            }
            // Proceed
            this.currentKey = this.keys[Math.floor(this.progress)] || "";
        }
        if (this.progress >= this.duration) {
            // Done!
            // TODO
            return;
        }
        if (this.currentKey) {
            this.currentDistanceToIdealTime = Math.abs(this.progress - Math.floor(this.progress) - 0.5);
        } else {
            this.currentDistanceToIdealTime = 0;
        }
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
            ctx.globalAlpha = (1 - this.progress + this.lastSuccess) * 0.5;
            ctx.fillRect(-w2 + 2, -h2 + 1, w - 4, h);
        }
        // Upcoming keys
        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        const sweetX = w2 - 16, y1 = -8, y2 = 1;
        for (let i = Math.floor(this.progress) - 2; i < this.progress + 8; i++) {
            const keys = this.keys[i];
            if (keys) {
                const diff = i - this.progress;
                const x = sweetX - diff * 10 - 6;
                const xp = (x - (-w2)) / w;
                const alpha = this.alphaCurve.get(xp);
                ctx.globalAlpha = alpha;
                if (keys.includes("1")) {
                    ctx.strokeStyle = ctx.fillStyle = "red";
                    ctx.strokeRect(x - 5, y1, 9, 9);
                    ctx.fillText("1", x, y1 + 8);
                }
                if (keys.includes("2")) {
                    ctx.strokeStyle = ctx.fillStyle = "blue";
                    ctx.strokeRect(x - 5, y2, 9, 9);
                    ctx.fillText("2", x, y2 + 8);
                }
            }
        }
        // Sweetspot
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#2080bf";
        ctx.fillRect(sweetX - 6, -h2 + 1, 1, h);
        ctx.fillRect(sweetX + 6, -h2 + 1, 1, h);
        ctx.restore();
    }
}
