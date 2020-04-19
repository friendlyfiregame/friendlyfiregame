
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

const timeDelta = Date.now() - performance.now();
export function now(): number {
    return performance.now() + timeDelta;
}
