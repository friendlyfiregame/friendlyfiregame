export async function loadImage(source: string | URL): Promise<HTMLImageElement> {
    const img = new Image();
    return new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject(new Error(`Unable to load image '${source}'`));
        };
        img.src = source instanceof URL ? source.href : `assets/${source}`;
    });
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas")!;

    canvas.width = width;
    canvas.height = height;

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

export function createContext2D(width: number, height: number): CanvasRenderingContext2D {
    return getRenderingContext(createCanvas(width, height), "2d");
}

export function getImageData(image: HTMLImageElement): ImageData {
    const ctx = createContext2D(image.width, image.height);
    ctx.drawImage(image, 0, 0, image.width, image.height);

    return ctx.getImageData(0, 0, image.width, image.height);
}
