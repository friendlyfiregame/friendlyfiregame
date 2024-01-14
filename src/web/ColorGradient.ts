import { clamp, rndItem } from "./util";
import { getImageData } from "./graphics";

export class ColorGradient {
    constructor(private readonly mapping: (p: number) => number[]) {}

    public get(p: number): number[] {
        return this.mapping(clamp(p, 0, 0.9999999999));
    }

    public getCss(p: number): string {
        const color = this.get(p);

        return `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`;
    }

    public static fromTable(table: number[][]): ColorGradient {
        const items = table.length;
        const grad = new ColorGradient((v) => {
            const index = Math.floor(v * items);
            return table[index];
        });

        return grad;
    }

    public static fromImage(img: HTMLImageElement): ColorGradient {
        const data = getImageData(img);
        const pixels = data.data;
        const w = img.naturalWidth, h = img.naturalHeight;
        let p = 0;

        if (h === 1) {
            // mapping each value to single unique color
            const colors: number[][] = [];

            for (let x = 0; x < w; x++) {
                colors.push([pixels[p++], pixels[p++], pixels[p++], pixels[p++]]);
            }

            return ColorGradient.fromTable(colors);
        } else {
            // mapping each value to randomly selected color of given set
            const colors: number[][][] = [];

            for (let x = 0; x < w; x++) {
                colors[x] = [];

                for (let y = 0; y < h; y++) {
                    const p = 4 * (x + w * y);
                    colors[x].push([pixels[p], pixels[p + 1], pixels[p + 2], pixels[p + 3]]);
                }
            }

            const items = w;

            return new ColorGradient((v) => {
                const index = Math.floor(v * items);
                return rndItem(colors[index]);
            });
        }
    }
}
