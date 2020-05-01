export async function loadImage(source: string | URL): Promise<HTMLImageElement> {
    const img = new Image();
    return new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject(new Error(`Unable to load image '${source}'`));
        }
        img.src = source instanceof URL ? source.href : `assets/${source}`;
    });
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas")!;
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

export function createContext2D(width: number, height: number): CanvasRenderingContext2D {
    return createCanvas(width, height).getContext("2d")!;
}

export function getImageData(image: HTMLImageElement): ImageData {
    const ctx = createContext2D(image.width, image.height);
    ctx.drawImage(image, 0, 0, image.width, image.height);
    return ctx.getImageData(0, 0, image.width, image.height);
}
