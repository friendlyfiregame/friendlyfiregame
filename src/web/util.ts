import { METER_PER_PIXEL, SOUND_INTENSITY_MULTIPLIER } from "../shared/constants";

export function rnd(minOrMax = 1, max?: number): number {
    if (max != null) {
        return minOrMax + Math.random() * (max - minOrMax);
    } else {
        return Math.random() * minOrMax;
    }
}

export function rndInt(minOrMax: number, max?: number): number {
    if (max != null) {
        return Math.floor(minOrMax + Math.random() * (max - minOrMax));
    } else {
        return Math.floor(Math.random() * minOrMax);
    }
}

export function rndItem<T>(array: T[]): T {
    const index = Math.floor(Math.random() * array.length);

    return array[index];
}

export function timedRnd(dt: number, averageDelay: number): number {
    let count = 0;
    let chance = dt - Math.random() * averageDelay;

    while (chance > 0) {
        count++;
        chance -= Math.random() * averageDelay;
    }

    return count;
}

export function clamp(v: number, min: number, max: number): number {
    return v < min ? min : v > max ? max : v;
}

export function orientPow(v: number, exp: number): number {
    if (v < 0) {
        return -((-v) ** exp);
    } else {
        return v ** exp;
    }
}

const timeDelta = Date.now() - performance.now();

export function now(): number {
    return performance.now() + timeDelta;
}

export function shiftValue(v: number, trg: number, inc: number): number {
    if (v === trg) {
        return trg;
    }

    if (v < trg) {
        v += inc;
        if (v >= trg) {
            return trg;
        }
    } else {
        v -= inc;
        if (v <= trg) {
            return trg;
        }
    }

    return v;
}

export async function sleep(ms = 0): Promise<void> {
    await new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Checks if the app is currently running inside of an Electron shell instance.
 *
 * @returns `true` if running inside an Electron shell, `false` otherwise.
 */
// TODO Migrate to userAgentData once the typings are in place.
export function isElectron(userAgent: string = navigator.userAgent): boolean {
    return !!userAgent.match(/\belectron\b/i);
}

/**
 * Figures out if development mode is enabled or not.
 */
export function isDev(): boolean {

    let devMode = false;

    // Legacy behavior.
    if (window.location.port === "8000") {
        devMode = true;
    }

    if (window.location.search !== "") {
        return window.location.search.substring(1).split("&").find(key => {
            if (key.toLowerCase().startsWith("dev")) {
                devMode = key.length === 3 || key.toLowerCase().endsWith("=true");
            }
        }) != null;
    }

    return devMode;
}

/**
 * Calculates the volume of a sound in regards to a distance and some additional properties.
 * @param distance  - the distance of the audio source to the audio listener (px)
 * @param intensity - Defines how "loud" the sound is or in other terms, how far it can be heard. Defaults to 1.
 * @param maxVolume - Defines the maximum volume of the sound (when distance is 0).
 *                    The sound will never be louder than this. Defaults to 1.
 */
export function calculateVolume(
    distance: number, maxVolume: number = 1, intensity: number = 1
): number {
    return Math.max(
        0,
        maxVolume - ((distance * METER_PER_PIXEL) / (SOUND_INTENSITY_MULTIPLIER * intensity))
    );
}

/** Factor to convert radians to degrees. */
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Converts degrees to radians.
 *
 * @param degrees - The value in degrees to convert to radians.
 * @return The given value converted to radians.
 */
export function radians(degrees: number): number {
    return degrees / RAD_TO_DEG;
}

/**
 * Converts radians to degrees.
 *
 * @param radians - The value in radians to convert to degrees.
 * @return The given value converted to degrees.
 */
export function degrees(radians: number): number {
    return radians * RAD_TO_DEG;
}

/**
 * Normalizes an angle in degrees so it is between 0 (inclusive) and 360 (exclusive).
 *
 * @param degrees - The angle to normalize.
 * @return The normalized angle.
 */
export function normalizeDegrees(degrees: number): number {
    return ((degrees % 360) + 360) % 360;
}

export function roundRect(
    ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number,
    up = false, tipOffset = 0
): CanvasRenderingContext2D {
    const halfWidth = w / 2;
    const halfHeight = h / 2;
    const middlePos = x + halfWidth;
    const rightPos = x + w;
    const bottomPos = y + h;

    if (w < 2 * r) { r = halfWidth; }
    if (h < 2 * r) { r = halfHeight; }

    ctx.beginPath();
    ctx.moveTo(x + r, y);

    if (up) {
        ctx.lineTo(middlePos - 4 + tipOffset, y);
        ctx.lineTo(middlePos + tipOffset, y - 4);
        ctx.lineTo(middlePos + 4 + tipOffset, y);
    }

    ctx.arcTo(rightPos, y, rightPos, bottomPos, r);
    ctx.arcTo(rightPos, bottomPos, x, bottomPos, r);

    if (!up) {
        ctx.lineTo(middlePos - 4 + tipOffset, bottomPos);
        ctx.lineTo(middlePos + tipOffset, bottomPos + 4);
        ctx.lineTo(middlePos + 4 + tipOffset, bottomPos);
    }

    ctx.arcTo(x, bottomPos, x, y, r);
    ctx.arcTo(x, y, rightPos, y, r);
    ctx.closePath();

    return ctx;
}
