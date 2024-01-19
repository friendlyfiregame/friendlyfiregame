import { describe, expect, it } from "@jest/globals";

import { Direction } from "../../geom/Direction";

describe("Direction", () => {

    it("TOP", () => {
        expect(Direction.isTop(Direction.TOP)).toBe(true);
        expect(Direction.isLeft(Direction.TOP)).toBe(false);
        expect(Direction.isBottom(Direction.TOP)).toBe(false);
        expect(Direction.isRight(Direction.TOP)).toBe(false);
        expect(Direction.isHorizontal(Direction.TOP)).toBe(false);
        expect(Direction.isVertical(Direction.TOP)).toBe(true);
        expect(Direction.isEdge(Direction.TOP)).toBe(true);
        expect(Direction.isCorner(Direction.TOP)).toBe(false);
        expect(Direction.getX(Direction.TOP)).toBe(0);
        expect(Direction.getY(Direction.TOP)).toBe(-1);
    });

    it("LEFT", () => {
        expect(Direction.isTop(Direction.LEFT)).toBe(false);
        expect(Direction.isLeft(Direction.LEFT)).toBe(true);
        expect(Direction.isBottom(Direction.LEFT)).toBe(false);
        expect(Direction.isRight(Direction.LEFT)).toBe(false);
        expect(Direction.isHorizontal(Direction.LEFT)).toBe(true);
        expect(Direction.isVertical(Direction.LEFT)).toBe(false);
        expect(Direction.isEdge(Direction.LEFT)).toBe(true);
        expect(Direction.isCorner(Direction.LEFT)).toBe(false);
        expect(Direction.getX(Direction.LEFT)).toBe(-1);
        expect(Direction.getY(Direction.LEFT)).toBe(0);
    });

    it("BOTTOM", () => {
        expect(Direction.isTop(Direction.BOTTOM)).toBe(false);
        expect(Direction.isLeft(Direction.BOTTOM)).toBe(false);
        expect(Direction.isBottom(Direction.BOTTOM)).toBe(true);
        expect(Direction.isRight(Direction.BOTTOM)).toBe(false);
        expect(Direction.isHorizontal(Direction.BOTTOM)).toBe(false);
        expect(Direction.isVertical(Direction.BOTTOM)).toBe(true);
        expect(Direction.isEdge(Direction.BOTTOM)).toBe(true);
        expect(Direction.isCorner(Direction.BOTTOM)).toBe(false);
        expect(Direction.getX(Direction.BOTTOM)).toBe(0);
        expect(Direction.getY(Direction.BOTTOM)).toBe(1);
    });

    it("RIGHT", () => {
        expect(Direction.isTop(Direction.RIGHT)).toBe(false);
        expect(Direction.isLeft(Direction.RIGHT)).toBe(false);
        expect(Direction.isBottom(Direction.RIGHT)).toBe(false);
        expect(Direction.isRight(Direction.RIGHT)).toBe(true);
        expect(Direction.isHorizontal(Direction.RIGHT)).toBe(true);
        expect(Direction.isVertical(Direction.RIGHT)).toBe(false);
        expect(Direction.isEdge(Direction.RIGHT)).toBe(true);
        expect(Direction.isCorner(Direction.RIGHT)).toBe(false);
        expect(Direction.getX(Direction.RIGHT)).toBe(1);
        expect(Direction.getY(Direction.RIGHT)).toBe(0);
    });
});
