const { PI, cos, sin } = Math;

export type Easing = (t: number) => number;

export function linear(t: number): number {
    return t;
}

export function easeInSine(t: number): number {
    return 1 - cos(t * PI / 2);
}

export function easeOutSine(t: number): number {
    return sin(t * PI / 2);
}

export function easeInOutSine(t: number): number {
    return 0.5 - cos(PI * t) / 2;
}

export function easeInQuad(t: number): number {
    return t * t;
}

export function easeOutQuad(t: number): number {
    return t * (2 - t);
}

export function easeInOutQuad(t: number): number {
    if (t < 0.5) {
        return 2 * t * t;
    } else {
        return 4 * t - 2 * t * t - 1;
    }
}

export function easeInCubic(t: number): number {
    return t ** 3;
}

export function easeOutCubic(t: number): number {
    return t ** 3 + 3 * (t - t * t);
}

export function easeInOutCubic(t: number): number {
    if (t < 0.5) {
        return 4 * t ** 3;
    } else {
        return 4 * t ** 3 + 12 * (t - t * t) - 3;
    }
}

export function easeInQuart(t: number): number {
    return t ** 4;
}

export function easeOutQuart(t: number): number {
    return 1 - (t - 1) ** 4;
}

export function easeInOutQuart(t: number): number {
    if (t < 0.5) {
        return 8 * t ** 4;
    } else {
        return 1 - 8 * (t - 1) ** 4;
    }
}

export function easeInQuint(t: number): number {
    return t ** 5;
}

export function easeOutQuint(t: number): number {
    return 1 + (t - 1) ** 5;
}

export function easeInOutQuint(t: number): number {
    if (t < 0.5) {
        return 16 * t ** 5;
    } else {
        return 1 + 16 * (t - 1) ** 5;
    }
}

export function easeInExpo(t: number): number {
    if (t <= 0) { return 0; }
    return 2 ** (10 * (t - 1));
}

export function easeOutExpo(t: number): number {
    if (t >= 1) {
        return 1;
    }
    return 1 - 1 / 1024 ** t;
}

export function easeInOutExpo(t: number): number {
    if (t <= 0) {
        return 0;
    }
    if (t >= 1) {
        return 1;
    }
    if (t < 0.5) {
        return 1048576 ** t / 2048;
    } else {
        return 1 - 512 / 1048576 ** t;
    }
}

export function easeInCirc(t: number): number {
    return 1 - (1 - t * t) ** 0.5;
}

export function easeOutCirc(t: number): number {
    return (2 * t - t * t) ** 0.5;
}

export function easeInOutCirc(t: number): number {
    if (t < 0.5) {
        return 0.5 - (0.25 - t * t) ** 0.5;
    } else {
        return ((4 * t * (2 - t) - 3) ** 0.5 + 1) / 2;
    }
}

export function easeInBack(t: number): number {
    return 2.70158 * t ** 3 - 1.70158 * t * t;
}

export function easeOutBack(t: number): number {
    return 2.70158 * t ** 3 - 6.40316 * t * t + 4.70158 * t;
}

export function easeInOutBack(t: number): number {
    if (t < 0.5) {
        return 14.379638 * t ** 3 - 5.189819 * t * t;
    } else {
        return 14.379638 * t ** 3 - 37.949095 * t * t + 32.759276 * t - 8.189819;
    }
}

export function easeInElastic(t: number): number {
    if (t <= 0) {
        return 0;
    }
    if (t >= 1) {
        return 1;
    }
    return 1024 ** (t - 1) * -sin(PI * (20 * t / 3 - 43 / 6));
}

export function easeOutElastic(t: number): number {
    if (t <= 0) {
        return 0;
    }
    if (t >= 1) {
        return 1;
    }
    return sin(PI * (20 * t / 3 - 0.5)) / (1024 ** t) + 1;
}

export function easeInOutElastic(t: number): number {
    if (t <= 0) {
        return 0;
    }
    if (t >= 1) {
        return 1;
    }
    if (t < 0.5) {
        return 1048576 ** t / -2048 * sin(PI * (80 * t / 9 - 89 / 18));
    } else {
        return 512 / 1048576 ** t * sin(PI * (80 * t / 9 - 89 / 18)) + 1;
    }
}

export function easeOutBounce(t: number): number {
    if (t < 4 / 11) {
        return 121 * t * t / 16;
    } else if (t < 8 / 11) {
        return 121 * t * t / 16 - 33 * t / 4 + 3;
    } else if (t < 10 / 11) {
        return 121 * t * t / 16 - 99 * t / 8 + 6;
    } else {
        return 121 * t * t / 16 - 231 * t / 16 + 63 / 8;
    }
}

export function easeInBounce(t: number): number {
    return 1 - easeOutBounce(1 - t);
}

export function easeInOutBounce(t: number): number {
    if (t < 0.5) {
        return easeInBounce(t * 2) / 2;
    } else {
        return easeOutBounce(t * 2 - 1) / 2 + 0.5;
    }
}
