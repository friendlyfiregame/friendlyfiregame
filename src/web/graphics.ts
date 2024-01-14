import { GAME_CANVAS_HEIGHT, GAME_CANVAS_WIDTH } from "../shared/constants";

/** Canvas used by the game to render stuff. It's a singleton... */
let gameCanvas: HTMLCanvasElement;

export async function loadImage(source: string | URL): Promise<HTMLImageElement> {
    const img = new Image();
    return new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject(new Error(`Unable to load image '${source.toString()}'`));
        };
        img.src = source instanceof URL ? source.href : `assets/${source}`;
    });
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
    const c = document.createElement("canvas");
    if (c == null) {
        throw new Error("No canvas support");
    }
    c.width = width;
    c.height = height;

    return c;
}

export function getGameCanvas(width: number = GAME_CANVAS_WIDTH, height: number = GAME_CANVAS_HEIGHT): HTMLCanvasElement {
    if (gameCanvas == null) {
        gameCanvas = createCanvas(width, height);
        gameCanvas.id = "game";
    }
    return gameCanvas;
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
