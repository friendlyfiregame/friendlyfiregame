import { Size } from './geometry/Size';

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

export function createCanvas(size: Size): HTMLCanvasElement {
    const canvas = document.createElement('canvas')!;

    canvas.width = size.width;
    canvas.height = size.height;

    return canvas;
}

export function getRenderingContext(canvas: HTMLCanvasElement, contextId: "2d",
    options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D;
export function getRenderingContext(canvas: HTMLCanvasElement, contextId: string, options?: unknown): RenderingContext {
    const ctx = canvas.getContext(contextId, options);
    if (ctx == null) {
        throw new Error(`Canvas doesn't support context with id '${contextId}'`);
    }
    return ctx;
}

export function createContext2D(size: Size): CanvasRenderingContext2D {
    return getRenderingContext(createCanvas(size), '2d');
}

export function getImageData(image: HTMLImageElement): ImageData {
    const ctx = createContext2D(new Size(image.width, image.height));
    ctx.drawImage(image, 0, 0, image.width, image.height);

    return ctx.getImageData(0, 0, image.width, image.height);
}
