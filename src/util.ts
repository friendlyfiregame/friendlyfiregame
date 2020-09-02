import { Bounds } from "./Entity";
import { GameObjectInfo } from "./MapInfo";
import { MapObjectJSON } from "*/level.json";
import { METER_PER_PIXEL, SOUND_INTENSITY_MULTIPLIER } from "./constants";

export type Vector2 = {x: number, y: number};

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

export function rndItem(array: any[] | string) {
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
        setTimeout(() => resolve(), ms);
    });
}

/**
 * Inplace array shuffling.
 * @param array The array.
 * @return The same array. But shuffled.
 */
export function shuffle<T>(array: T[]): T[] {
    for (let i = 1; i < array.length; i++) {
        const j = Math.floor(Math.random() * (i + 1));

        if (i !== j) {
            const tmp = array[i];
            array[i] = array[j];
            array[j] = tmp;
        }
    }

    return array;
}

export function boundsFromMapObject(o: MapObjectJSON | GameObjectInfo, margin = 0): Bounds {
    const width = o.width + (margin * 2);
    const height = o.height + (margin * 2);
    const x = o.x - margin;
    const y = o.y + margin;

    return { x, y, width, height };
}

export function isElectron(): boolean {
    return !!navigator.userAgent.match(/\belectron\b/i);
}

/**
 * Figures out if development mode is enabled or not.
 */
export function isDev(): boolean {
    // Legacy behavior.
    if (window.location.port === "8000") {
        return true;
    }

    if (!!window.location.search) {
        return !!window.location.search.substr(1).split("&").find(key => {
            if (key.toLowerCase().startsWith("dev")) {
                return key.length === 3 || key.endsWith("=true");
            }
            return false;
        });
    }

    return false;
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
    )
}
