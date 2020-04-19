import { rnd, clamp } from './util';
import { loadImage } from './graphics';
import { ColorGradient } from './ColorGradient';


export class FireGfx {
    public static gradient: ColorGradient;
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private data: number[][];
    private decayData: number[][];
    private imageData: ImageData;
    private returnColor: number[] = [0, 0, 0, 255];
    private updateSteps = 0;

    constructor(
        private w = 48,
        private h = 64,
        private stepModulo = 3
    ) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.w;
        this.canvas.height = this.h;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.imageData = this.context.getImageData(0, 0, this.w, this.h);
        this.data = [];
        this.decayData = [];
        this.init();
    }

    public static async load(): Promise<void> {
        const gradientImg = await loadImage("gradients/fire.png");
        this.gradient = ColorGradient.fromImage(gradientImg);
        console.log(this.gradient);
    }

    private init() {
        const decay = this.decayData;
        const data = this.data;
        for (let y = 0; y < this.h; y++) {
            const row: number[] = data[y] = [];
            const decayRow: number[] = decay[y] = [];
            const yrel = y / (this.h - 1);
            for (let x = 0; x < this.w; x++) {
                row[x] = 0;
                decayRow[x] = this.getDecay(x / (this.w - 1), yrel);
            }
        }
        const bottom = data[this.h - 1];
        for (let x = 0; x < this.w; x++) {
            const smooth = 0.5 - 0.5 * Math.cos(2 * Math.PI * x / (this.w - 1));
            bottom[x] = 1.25 * Math.pow(smooth, 0.5);
        }
    }

    private getDecay(xrel: number, yrel: number): number {
        if (xrel > 0.5) { xrel = 1 - xrel; }
        return 0.02 + (0.5 - xrel) * 0.1 + Math.pow(1 - yrel, 8);
    }

    public update(dt: number) {
        this.updateSteps++;
        if (this.updateSteps % this.stepModulo === 0) {
            this.updateStep();
            this.render();
        }
    }

    private updateStep() {
        const data = this.data;
        let fromRow = data[0];
        // Let all fire rows move upward, so update rows from top to bottom
        for (let y = 0; y < this.h - 1; y++) {
            const row = fromRow, decayRow = this.decayData[y];
            fromRow = data[y + 1];
            for (let x = 0; x < this.w; x++) {
                const fromX = clamp(x + rnd(-1, 1) * rnd(), 0.3, this.w - 1.3);
                const fromX1 = Math.floor(fromX), fx = fromX - fromX1;
                const v = fx * fromRow[fromX1 + 1] + (1 - fx) * fromRow[fromX1] - decayRow[x];
                row[x] = clamp(v, 0, Infinity);
            }
        }
    }

    private render() {
        const pixels = this.imageData.data;
        const data = this.data;
        let p = 0, col = [0];
        for (let y = 0; y < this.h; y++) {
            const row = data[y];
            for (let x = 0; x < this.w; x++) {
                col = this.valueToColor(row[x]);
                pixels[p++] = col[0];
                pixels[p++] = col[1];
                pixels[p++] = col[2];
                pixels[p++] = col[3];
            }
        }
        this.context.putImageData(this.imageData, 0, 0);
    }

    public valueToColor(v: number): number[] {
        return FireGfx.gradient.get(clamp(v, 0, 1));
    }

    public oldValueToColor(v: number): number[] {
        v = clamp(v, 0, 1);
        const v255 = 255 * v;
        this.returnColor[0] = 255;
        this.returnColor[1] = v255;
        this.returnColor[2] = v255 * v;
        this.returnColor[3] = v255;
        return this.returnColor;
    }

    public getImage() {
        return this.canvas;
    }

    public draw(ctx: CanvasRenderingContext2D, x = 0, y = 0) {
        const img = this.getImage();
        ctx.drawImage(img, x - img.width / 2, -y - img.height);
    }
}
