import { rnd, clamp, orientPow } from './util';
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
    private bottomLine: number[] = [];

    constructor(
        private w = 48,
        private h = 64,
        private coneShaped = true,
        private stepModulo = 2
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
            const xrel = x / (this.w - 1);
            const stuffedXrel = this.coneShaped ? clamp(2 * xrel - 0.5, 0, 1) : xrel;
            const smooth = 0.5 - 0.5 * Math.cos(2 * Math.PI * stuffedXrel);
            bottom[x] = 1.25 * Math.pow(smooth, 0.5);
        }
        this.bottomLine = bottom.slice();
    }

    private getDecay(xrel: number, yrel: number): number {
        if (xrel > 0.5) { xrel = 1 - xrel; }
        if (this.coneShaped) {
            yrel = 1.2 * yrel;
            if (yrel > 1) {
                return 0.02;
            }
        }
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
        let fromX = 0, toCenter = 0, midX = (this.w - 1) * 0.5, toCenter1 = 1;
        const yThreshold = this.coneShaped ? this.h * 0.8 : Infinity;
        // Let all fire rows move upward, so update rows from top to bottom
        for (let y = 0; y < this.h - 1; y++) {
            const row = fromRow, decayRow = this.decayData[y];
            fromRow = data[y + 1];
            if (y > yThreshold) {
                const yp = (y - yThreshold) / (this.h - yThreshold);
                toCenter = 0.15 * yp * yp;
                toCenter1 = 1 - toCenter;
            }
            for (let x = 0; x < this.w; x++) {
                fromX = clamp(x + rnd(-1, 1) * rnd(), 0.3, this.w - 1.3);
                if (toCenter) {
                    fromX = toCenter * midX + toCenter1 * fromX;
                }
                const fromX1 = Math.floor(fromX), fx = fromX - fromX1;
                const v = fx * fromRow[fromX1 + 1] + (1 - fx) * fromRow[fromX1] - decayRow[x] + rnd(-0.03, 0.02);
                row[x] = clamp(v, 0, Infinity);
            }
        }
        // Bottom line always stays mostly the same, only minor variations
        const row = data[this.h - 1];
        const t = this.updateSteps * 0.1
        const skew = 0.5 * orientPow(Math.sin(t) * Math.sin(t * 0.353) * Math.sin(t * 0.764) * Math.sin(t * 0.5433)
                * Math.sin(t * 1.634) * Math.sin(t * 1.342), 1.5);
        const exponent = (skew > 0) ? 1 + skew : 1 / (1 - skew);
        for (let x = 0; x < this.w; x++) {
            // const f = 1 + 0.5 * Math.sin(0.1 * x + t) * Math.sin()
            let f = 1.2 + (0.8 * Math.sin(t) * Math.sin(0.1 * x * t) * Math.sin(-0.07 * x * t)) ** 2;
            const baseX = Math.floor((this.w - 1) * (x / (this.w - 1)) ** exponent);
            row[x] = this.bottomLine[baseX] * f;
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
