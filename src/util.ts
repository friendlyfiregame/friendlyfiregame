import { Bounds } from './Entity';
import { GameObjectInfo } from './MapInfo';
import { MapObjectJSON } from '*/level.json';
import { Point, Size } from './Geometry';

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
    const position = new Point(
        o.x - margin,
        o.y + margin
    );

    const size = new Size(
        o.width + (margin * 2),
        o.height + (margin * 2)
    );

    return { position, size };
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
        return !!window.location.search.substr(1).split("&").find(key => key.toLowerCase().startsWith("dev"));
    }
    return false;
}
