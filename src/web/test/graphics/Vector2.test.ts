import { describe, expect, it } from "@jest/globals";

import { AffineTransform } from "../../graphics/AffineTransform";
import { Vector2 } from "../../graphics/Vector2";

describe("Vector2", () => {
    describe("constructor", () => {
        it("initializes vector with 0 if no argument is given", () => {
            const vector = new Vector2();
            expect(vector.x).toBe(0);
            expect(vector.y).toBe(0);
        });
        it("initializes vector to given numeric values", () => {
            const vector = new Vector2(4, 5);
            expect(vector.x).toBe(4);
            expect(vector.y).toBe(5);
        });
    });

    describe("setComponents", () => {
        it("sets vector to given numeric values", () => {
            const vector = new Vector2().setComponents(4, 5);
            expect(vector.x).toBe(4);
            expect(vector.y).toBe(5);
        });
    });

    describe("setVector", () => {
        it("sets vector with 2D vector", () => {
            const vector = new Vector2().setVector(new Vector2(10, 20));
            expect(vector.x).toBe(10);
            expect(vector.y).toBe(20);
        });
    });

    describe("clone", () => {
        it("returns new vector", () => {
            const vector = new Vector2(6, 7);
            const clone = vector.clone();
            expect(clone).toBeInstanceOf(Vector2);
            expect(clone.x).toBe(6);
            expect(clone.y).toBe(7);
            expect(clone).not.toBe(vector);
        });
    });

    describe("xy getters", () => {
        it("reads the vector components", () => {
            const v = new Vector2(4, 3);
            expect(v.x).toBe(4);
            expect(v.y).toBe(3);
        });
    });

    describe("xy setters", () => {
        it("sets the vector components", () => {
            const v = new Vector2();
            v.x = 2;
            v.y = 4;
            expect(v).toEqual(new Vector2(2, 4));
        });
    });

    describe("negate", () => {
        it("negates the vector", () => {
            const v = new Vector2(1, 2);
            const result = v.negate();
            expect(result).toBe(v);
            expect(result).toEqual(new Vector2(-1, -2));
        });
    });

    describe("add", () => {
        it("component-wise adds a vector to the vector", () => {
            const v1 = new Vector2(1, 2);
            const v2 = new Vector2(3, 4);
            const result = v1.add(v2);
            expect(result).toBe(v1);
            expect(result).toEqual(new Vector2(4, 6));
        });
    });

    describe("sub", () => {
        it("component-wise subtracts a vector from the vector", () => {
            const v1 = new Vector2(1, 2);
            const v2 = new Vector2(3, 4);
            const result = v1.sub(v2);
            expect(result).toBe(v1);
            expect(result).toEqual(new Vector2(-2, -2));
        });
    });

    describe("getLength", () => {
        it("returns the length of the vector", () => {
            expect(new Vector2(-2, 3).getLength()).toBeCloseTo(3.60555);
        });
    });

    describe("getSquareLength", () => {
        it("returns the square length of the vector", () => {
            expect(new Vector2(-2, 3).getSquareLength()).toBeCloseTo(13);
        });
    });

    describe("getDistance", () => {
        it("returns the distance between two vectors", () => {
            expect(new Vector2(2, -5).getDistance(new Vector2(-9, 12))).toBeCloseTo(20.2485);
        });
    });

    describe("getSquareDistance", () => {
        it("returns the square distance between two vectors", () => {
            expect(new Vector2(2, -5).getSquareDistance(new Vector2(-9, 12))).toBeCloseTo(410);
        });
    });

    describe("dot", () => {
        it("returns the dot product", () => {
            expect(new Vector2(1, 2).dot(new Vector2(3, 4))).toBe(11);
        });
    });

    describe("normalize", () => {
        it("normalizes the vector", () => {
            const v = new Vector2(1, 2);
            const result = v.normalize();
            expect(result).toBe(v);
            expect(result).toEqual(new Vector2(0.4472135954999579, 0.8944271909999159));
        });
    });

    describe("mul", () => {
        it("multiplies the vector with an affine transform", () => {
            const v = new Vector2(3, 4);
            const m = new AffineTransform(5, 6, 7, 8, 9, 10);
            const result = v.mul(m);
            expect(result).toBe(v);
            expect(result).toEqual(new Vector2(52, 60));
        });
    });

    describe("div", () => {
        it("multiplies the vector with the inverse of the given affine transform", () => {
            const v = new Vector2(52, 60);
            const m = new AffineTransform(5, 6, 7, 8, 9, 10);
            const result = v.div(m);
            expect(result).toBe(v);
            expect(result).toEqual(new Vector2(3, 4));
        });
    });
});
