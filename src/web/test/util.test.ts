import { clamp } from "../util";

describe("util", () => {
    it("clamp()", () => {
        expect(clamp(0, 0, 0)).toBe(0);
        expect(clamp(-1, 0, 0)).toBe(0);
        expect(clamp(-1, -1, 0)).toBe(-1);
        expect(clamp(1, 0, 0)).toBe(0);
        expect(clamp(0, 1, 2)).toBe(1);
        expect(clamp(3, 1, 2)).toBe(2);
    });
});
