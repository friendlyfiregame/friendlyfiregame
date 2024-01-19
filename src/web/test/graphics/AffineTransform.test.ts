import "jest-extended";

import { describe, expect, it } from "@jest/globals";

import { createCanvas, getRenderingContext } from "../../graphics";
import { AffineTransform } from "../../graphics/AffineTransform";
import { degrees, normalizeDegrees, radians } from "../../util";

describe("AffineTransform", () => {
    describe("constructor", () => {
        it("initializes identity matrix if no arguments are given", () => {
            const m = new AffineTransform();
            expect(m).toEqual(new AffineTransform(
                1, 0,
                0, 1,
                0, 0
            ));
        });
        it("initializes matrix with given elements", () => {
            const m = new AffineTransform(1, 2, 3, 4, 5, 6);
            expect(m).toEqual(new AffineTransform(
                 1, 2,
                 3, 4,
                 5, 6
            ));
        });
    });

    describe("getters", () => {
        it("reads the matrix components", () => {
            const m = new AffineTransform(2, 3, 4, 5, 6, 7);
            expect(m.m11).toBe(2);
            expect(m.m12).toBe(3);
            expect(m.m21).toBe(4);
            expect(m.m22).toBe(5);
            expect(m.dx).toBe(6);
            expect(m.dy).toBe(7);
        });
    });

    describe("setters", () => {
        it("sets the matrix components", () => {
            const m = new AffineTransform();
            m.m11 = 2;
            m.m12 = 4;
            m.m21 = 8;
            m.m22 = 10;
            m.dx = 14;
            m.dy = 16;
            expect(m).toEqual(new AffineTransform(2, 4, 8, 10, 14, 16));
        });
    });

    describe("setComponents", () => {
        it("sets the matrix components", () => {
            const m = new AffineTransform();
            m.setComponents(2, 4, 6, 8, 10, 12);
            expect(m).toEqual(new AffineTransform(2, 4, 6, 8, 10, 12));
        });
    });

    describe("setMatrix", () => {
        it("sets the matrix components from other matrix", () => {
            const m = new AffineTransform();
            m.setMatrix(new AffineTransform(2, 4, 6, 8, 10, 12));
            expect(m).toEqual(new AffineTransform(2, 4, 6, 8, 10, 12));
        });
    });

    describe("clone", () => {
        it("returns new matrix", () => {
            const matrix = new AffineTransform(6, 7, 1, 2, 3, 4);
            const clone = matrix.clone();
            expect(clone).toBeInstanceOf(AffineTransform);
            expect(clone).toEqual(new AffineTransform(6, 7, 1, 2, 3, 4));
            expect(clone).not.toBe(matrix);
        });
    });

    describe("isIdentity", () => {
        it("returns true if matrix is an identity matrix", () => {
            expect(new AffineTransform(
                1, 0,
                0, 1,
                0, 0
            ).isIdentity()).toBe(true);
        });
        it("returns false if matrix is not an identity matrix", () => {
            expect(new AffineTransform(2, 0, 0, 1, 0, 0).isIdentity()).toBe(false);
            expect(new AffineTransform(1, 2, 0, 1, 0, 0).isIdentity()).toBe(false);
            expect(new AffineTransform(1, 0, 2, 1, 0, 0).isIdentity()).toBe(false);
            expect(new AffineTransform(1, 0, 0, 2, 0, 0).isIdentity()).toBe(false);
            expect(new AffineTransform(1, 0, 0, 1, 2, 0).isIdentity()).toBe(false);
            expect(new AffineTransform(1, 0, 0, 1, 0, 2).isIdentity()).toBe(false);
        });
    });

    describe("mul", () => {
        it("multiplies matrix with another matrix", () => {
            const a = new AffineTransform(20, 3, 40, 5, 60, 7);
            const b = new AffineTransform(3, 40, 5, 60, 7, 80);
            const result = a.mul(b);
            expect(result).toBe(a);
            expect(result).toEqual(new AffineTransform(
                1660, 209,
                2500, 315,
                3400, 428
            ));
        });
    });

    describe("div", () => {
        it("divides matrix by another matrix", () => {
            const a = new AffineTransform(1660, 209, 2500, 315, 3400, 428);
            const b = new AffineTransform(3, 40, 5, 60, 7, 80);
            const result = a.div(b);
            expect(result).toBe(a);
            expect(result).toEqual(new AffineTransform(20, 3, 40, 5, 60, 7));
        });
    });

    describe("getDeterminant", () => {
        it("returns the matrix determinant", () => {
            expect(new AffineTransform(6, 3, 7, 20, 5, 8).getDeterminant()).toBe(99);
            expect(new AffineTransform(41, 13, 13, 812, -44, 0).getDeterminant()).toBe(33123);
            expect(new AffineTransform(1, 5, 10, 9, 4, 6).getDeterminant()).toBe(-41);
        });
    });

    describe("invert", () => {
        it("inverts the matrix", () => {
            const m = new AffineTransform(1, 5, 10, 9, 4, 6);
            const result = m.invert();
            expect(result).toEqual(new AffineTransform(
                -0.21951219512195122, 0.12195121951219512,
                0.24390243902439024, -0.024390243902439025,
                -0.5853658536585366, -0.34146341463414637
            ));
        });
    });

    describe("translate", () => {
        it("translates the matrix", () => {
            const m = new AffineTransform(1, 2, 3, 4, 5, 6);
            const result = m.translate(10, 20);
            expect(result).toBe(m);
            expect(result).toEqual(new AffineTransform(
                 1,   2,
                 3,   4,
                75, 106
            ));
        });
    });

    describe("translateX", () => {
        it("translates the matrix by given X delta", () => {
            const m = new AffineTransform(1, 2, 3, 4, 5, 6);
            const result = m.translateX(10);
            expect(result).toBe(m);
            expect(result).toEqual(new AffineTransform(
                 1,  2,
                 3,  4,
                15, 26
            ));
        });
    });

    describe("getTranslationX", () => {
        it("returns the horizontal translation of the matrix", () => {
            expect(new AffineTransform(1, 0, 0, 1, -9.1, 3).getTranslationX()).toBeCloseTo(-9.1);
        });
    });

    describe("translateY", () => {
        it("translates the matrix by given Y delta", () => {
            const m = new AffineTransform(1, 2, 3, 4, 5, 6);
            const result = m.translateY(10);
            expect(result).toBe(m);
            expect(result).toEqual(new AffineTransform(
                 1,  2,
                 3,  4,
                35, 46
            ));
        });
    });

    describe("getTranslationY", () => {
        it("returns the vertical translation of the matrix", () => {
            expect(new AffineTransform(1, 0, 0, 1, 41.3, 49.13).getTranslationY()).toBeCloseTo(49.13);
        });
    });

    describe("setTranslation", () => {
        it("sets translation matrix", () => {
            const m = new AffineTransform(7, 2, 3, 4, 5, 6);
            const result = m.setTranslation(2, 3);
            expect(result).toBe(m);
            expect(result).toEqual(new AffineTransform(
                1, 0,
                0, 1,
                2, 3
            ));
        });
    });

    describe("createTranslation", () => {
        it("creates translation matrix", () => {
            const m = AffineTransform.createTranslation(2, 3);
            expect(m).toEqual(new AffineTransform(
                1, 0,
                0, 1,
                2, 3
            ));
        });
    });

    describe("scale", () => {
        it("scales the matrix by given scale factor", () => {
            const m = new AffineTransform(1, 2, 3, 4, 5, 6);
            const result = m.scale(10);
            expect(result).toBe(m);
            expect(result).toEqual(new AffineTransform(
                10, 20,
                30, 40,
                 5,  6
            ));
        });
        it("scales the matrix by given individual scale factors", () => {
            const m = new AffineTransform(1, 2, 3, 4, 5, 6);
            const result = m.scale(10, 20);
            expect(result).toBe(m);
            expect(result).toEqual(new AffineTransform(
                10, 20,
                60, 80,
                 5,  6
            ));
        });
    });

    describe("scaleX", () => {
        it("scales the matrix by given X scale factor", () => {
            const m = new AffineTransform(1, 2, 3, 4, 5, 6);
            const result = m.scaleX(10);
            expect(result).toBe(m);
            expect(result).toEqual(new AffineTransform(
                10, 20,
                 3,  4,
                 5,  6
            ));
        });
    });

    describe("getScaleX", () => {
        it("returns the horizontal scaling factor of the matrix", () => {
            const matrix = new AffineTransform();
            matrix.translate(1, 2);
            matrix.scale(10, 1);
            expect(matrix.getScaleX()).toBeCloseTo(10);
            matrix.scale(0.5, 1);
            expect(matrix.getScaleX()).toBeCloseTo(5);
            matrix.rotate(radians(23.45));
            expect(matrix.getScaleX()).toBeCloseTo(5);
        });
        it("returns horizontal scaling for every rotation angle", () => {
            for (let i = -360; i <= 360; i++) {
                const matrix = AffineTransform.createScale(5, 10).rotate(radians(i));
                expect(matrix.getScaleX()).toBeCloseTo(5);
            }
        });
        it("returns correct X scale when Y scale is 0", () => {
            expect(AffineTransform.createScale(10, 0).rotate(1.3).getScaleX()).toBeCloseTo(10);
        });
        it("returns 0 for scale 0", () => {
            expect(AffineTransform.createScale(0).rotate(0.5).getScaleX()).toBe(0);
            expect(AffineTransform.createScale(0, 40).rotate(1.3).getScaleX()).toBe(0);
        });
    });

    describe("scaleY", () => {
        it("scales the matrix by given Y scale factor", () => {
            const m = new AffineTransform(1, 2, 3, 4, 5, 6);
            const result = m.scaleY(10);
            expect(result).toBe(m);
            expect(result).toEqual(new AffineTransform(
                 1,  2,
                30, 40,
                 5,  6
            ));
        });
    });

    describe("getScaleY", () => {
        it("returns the vertical scaling factor of the matrix", () => {
            const matrix = new AffineTransform();
            matrix.translate(10, 20);
            matrix.scale(1, 10);
            expect(matrix.getScaleY()).toBeCloseTo(10);
            matrix.scale(1, 0.5);
            expect(matrix.getScaleY()).toBeCloseTo(5);
            matrix.rotate(radians(78.93));
            expect(matrix.getScaleY()).toBeCloseTo(5);
        });
        it("returns vertical scaling for every rotation angle", () => {
            for (let i = -360; i <= 360; i++) {
                const matrix = AffineTransform.createScale(41, 12).rotate(radians(i));
                expect(matrix.getScaleY()).toBeCloseTo(12);
            }
        });
        it("returns correct Y scale when X scale is 0", () => {
            expect(AffineTransform.createScale(0, 10).rotate(1.3).getScaleY()).toBeCloseTo(10);
        });
        it("returns 0 for scale 0", () => {
            expect(AffineTransform.createScale(0).rotate(0.5).getScaleY()).toBe(0);
            expect(AffineTransform.createScale(40, 0).rotate(1.3).getScaleY()).toBe(0);
        });
    });

    describe("setScale", () => {
        it("sets scale matrix with common scale factor", () => {
            const m = new AffineTransform(7, 2, 3, 4, 5, 6);
            const result = m.setScale(20);
            expect(result).toBe(m);
            expect(result).toEqual(new AffineTransform(
                20, 0,
                0, 20,
                0, 0
            ));
        });
        it("sets scale matrix with individual scale factors", () => {
            const m = new AffineTransform(8, 2, 3, 4, 5, 6);
            const result = m.setScale(20, 30);
            expect(result).toBe(m);
            expect(result).toEqual(new AffineTransform(
                20, 0,
                0, 30,
                0, 0
            ));
        });
    });

    describe("createScale", () => {
        it("creates scale matrix with common scale factor", () => {
            const m = AffineTransform.createScale(20);
            expect(m).toEqual(new AffineTransform(
                20, 0,
                0, 20,
                0, 0
            ));
        });
        it("creates scale matrix with individual scale factors", () => {
            const m = AffineTransform.createScale(20, 30);
            expect(m).toEqual(new AffineTransform(
                20, 0,
                0, 30,
                0, 0
            ));
        });
    });

    describe("rotate", () => {
        it("rotates the matrix", () => {
            const m = new AffineTransform(1, 2, 3, 4, 5, 6);
            const result = m.rotate(0.5);
            expect(result).toBe(m);
            expect(result).toEqual(new AffineTransform(
                2.3158591777029818, 3.6728672781975575,
                2.1533221470669153, 2.551479170353085,
                5, 6
            ));
        });
    });

    describe("getRotation", () => {
        it("returns the rotation of the matrix in radians", () => {
            const matrix = new AffineTransform();
            expect(matrix.getRotation()).toBe(0);
            matrix.rotate(radians(20));
            expect(degrees(matrix.getRotation())).toBeCloseTo(20);
            matrix.rotate(radians(-40));
            expect(degrees(matrix.getRotation())).toBeCloseTo(-20);
            matrix.translate(10, -30);
            expect(degrees(matrix.getRotation())).toBeCloseTo(-20);
            matrix.scale(3);
            expect(degrees(matrix.getRotation())).toBeCloseTo(-20);
            matrix.scale(0.1);
            expect(degrees(matrix.getRotation())).toBeCloseTo(-20);
            matrix.scale(10);
            expect(degrees(matrix.getRotation())).toBeCloseTo(-20);
            matrix.rotate(radians(180));
            expect(degrees(matrix.getRotation())).toBeCloseTo(160);
            matrix.rotate(radians(180));
            expect(degrees(matrix.getRotation())).toBeCloseTo(-20);
        });
        it("returns the rotation for any angle", () => {
            for (let i = -360; i < 360; i++) {
                const m = new AffineTransform().translate(10, 20).scale(2, 3).rotate(radians(i));
                expect(normalizeDegrees(degrees(m.getRotation()))).toBeCloseTo(normalizeDegrees(i));
            }
        });
        it("returns correct rotation when Y scale is 0", () => {
            for (let i = 0; i < 360; i++) {
                const m = new AffineTransform().translate(10, 20).scale(1, 0).rotate(radians(i));
                expect(normalizeDegrees(degrees(m.getRotation()))).toBeCloseTo(i);
            }
        });
        it("returns correct rotation when X scale is 0", () => {
            for (let i = 0; i < 360; i++) {
                const m = new AffineTransform().translate(10, 20).scale(0, 1).rotate(radians(i));
                expect(normalizeDegrees(degrees(m.getRotation()))).toBeCloseTo(i);
            }
        });
        it("returns 0 when scale is 0", () => {
            for (let i = 0; i < 360; i++) {
                const m = new AffineTransform().translate(10, 20).scale(0).rotate(radians(i));
                expect(m.getRotation()).toBe(0);
            }
        });
    });

    describe("setRotation", () => {
        it("sets rotation matrix", () => {
            const m = new AffineTransform(7, 2, 3, 4, 5, 6);
            const result = m.setRotation(0.5);
            expect(result).toBe(m);
            expect(result).toEqual(new AffineTransform(
                0.8775825618903728, 0.479425538604203,
                -0.479425538604203, 0.8775825618903728,
                0, 0
            ));
        });
    });

    describe("createRotation", () => {
        it("creates rotation matrix", () => {
            const m = AffineTransform.createRotation(0.5);
            expect(m).toEqual(new AffineTransform(
                0.8775825618903728, 0.479425538604203,
                -0.479425538604203, 0.8775825618903728,
                0, 0
            ));
        });
    });

    describe("fromDOMMatrix", () => {
        it("creates matrix from a DOMMatrix", () => {
            const domMatrix = new DOMMatrix([ 2, 3, 4, 5, 6, 7 ]);
            const matrix = AffineTransform.fromDOMMatrix(domMatrix);
            expect(matrix).toEqual(new AffineTransform(2, 3, 4, 5, 6, 7));
        });
        it("throws exception when DOMMatrix is not a 2D matrix", () => {
            const domMatrix = new DOMMatrix([ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 ]);
            expect(() => AffineTransform.fromDOMMatrix(domMatrix)).toThrowError(
                "Can only create Matrix3 from 2D DOMMatrix");
        });
    });

    describe("toDOMMatrix", () => {
        it("creates DOMMatrix from matrix", () => {
            const matrix = new AffineTransform(2, 3, 4, 5, 6, 7);
            const domMatrix = matrix.toDOMMatrix();
            expect(domMatrix.toFloat32Array()).toEqual(
                new Float32Array([ 2, 3, 0, 0, 4, 5, 0, 0, 0, 0, 1, 0, 6, 7, 0, 1 ]));
            expect(domMatrix.is2D).toBe(true);
        });
    });

    describe("setCanvasTransform", () => {
        it("sets the transformation matrix of a canvas", () => {
            const m = new AffineTransform(2, 3, 4, 5, 6, 7);
            const canvas = createCanvas(100, 100);
            const ctx = getRenderingContext(canvas, "2d");
            ctx.setTransform(3, 123, 4598, 12, 59, 39);
            m.setCanvasTransform(ctx);
            const m2 = ctx.getTransform();
            expect(m2.a).toBeCloseTo(m.m11);
            expect(m2.b).toBeCloseTo(m.m12);
            expect(m2.c).toBeCloseTo(m.m21);
            expect(m2.d).toBeCloseTo(m.m22);
            expect(m2.e).toBeCloseTo(m.dx);
            expect(m2.f).toBeCloseTo(m.dy);
        });
    });
    describe("transformCanvas", () => {
        it("transforms the transformation matrix of a canvas", () => {
            const m = new AffineTransform(2, 3, 4, 5, 6, 7);
            const canvas = createCanvas(100, 100);
            const ctx = getRenderingContext(canvas, "2d");
            ctx.setTransform(3, 123, 4598, 12, 59, 39);
            m.transformCanvas(ctx);
            const m2 = ctx.getTransform();
            expect(m2.a).toBeCloseTo(13800);
            expect(m2.b).toBeCloseTo(282);
            expect(m2.c).toBeCloseTo(23002);
            expect(m2.d).toBeCloseTo(552);
            expect(m2.e).toBeCloseTo(32263);
            expect(m2.f).toBeCloseTo(861);
        });
    });
});
