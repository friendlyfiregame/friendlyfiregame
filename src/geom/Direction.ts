export enum Direction {
    CENTER = 0,
    LEFT = 1,
    RIGHT = 2,
    TOP = 4,
    BOTTOM = 8,
    TOP_LEFT = TOP | LEFT,
    BOTTOM_LEFT = BOTTOM | LEFT,
    TOP_RIGHT = TOP | RIGHT,
    BOTTOM_RIGHT = BOTTOM | RIGHT
}

export namespace Direction {
    export function isLeft(direction: Direction): boolean {
        return (direction & Direction.LEFT) !== 0;
    }

    export function isRight(direction: Direction): boolean {
        return (direction & Direction.RIGHT) !== 0;
    }

    export function isTop(direction: Direction): boolean {
        return (direction & Direction.TOP) !== 0;
    }

    export function isBottom(direction: Direction): boolean {
        return (direction & Direction.BOTTOM) !== 0;
    }

    export function isHorizontal(direction: Direction): boolean {
        return isLeft(direction) || isRight(direction);
    }

    export function isVertical(direction: Direction): boolean {
        return isLeft(direction) || isRight(direction);
    }

    export function isEdge(direction: Direction): boolean {
        return direction === Direction.LEFT
            || direction === Direction.RIGHT
            || direction === Direction.TOP
            || direction === Direction.BOTTOM;
    }

    export function isCorner(direction: Direction): boolean {
        return direction === Direction.TOP_LEFT
            || direction === Direction.TOP_RIGHT
            || direction === Direction.BOTTOM_LEFT
            || direction === Direction.BOTTOM_RIGHT;
    }

    export function getX(direction: Direction): number {
        return isLeft(direction) ? -1 : isRight(direction) ? 1 : 0;
    }

    export function getY(direction: Direction): number {
        return isTop(direction) ? -1 : isBottom(direction) ? 1 : 0;
    }
}
