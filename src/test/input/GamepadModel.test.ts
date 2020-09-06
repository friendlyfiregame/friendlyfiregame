import { GamepadModel, DEFAULT_GAMEPAD_MODEL } from "../../input/GamepadModel";
import { GamepadStyle } from "../../input/GamepadStyle";

/* spell-checker: disable */
const xboxModels = [
    "Xbox 360 Controller (XInput STANDARD GAMEPAD)",
    "xinput",
    "Xbox One Controller (STANDARD GAMEPAD Vendor: 045e Product: 02ea)",
    "Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 02fd)",
    "Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)",
    "Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 02e0)",
    "Microsoft Controller (STANDARD GAMEPAD Vendor: 045e Product: 02ea)"
];

const psModels = [
    "Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)",
    "Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 05c4)",
    "054c-09cc-Wireless Controller",
    "054c-05c4-Wireless Controller",
    "PLAYSTATION(R)3 Controller (Vendor: 054c Product: 0268)",
    "PS3 GamePad (Vendor: 054c Product: 0268)",
    "Sony PLAYSTATION(R)3 Controller (STANDARD GAMEPAD Vendor: 054c Product: 0268)",
    "PLAYSTATION(R)3 Controller (STANDARD GAMEPAD Vendor: 054c Product: 0268)"
];

const stadiaModels = [
    "Stadia Controller (STANDARD GAMEPAD Vendor: 18d1 Product: 9400)",
    "Google Inc. Stadia Controller (STANDARD GAMEPAD Vendor: 18d1 Product: 9400)"
];

const unknownModels = [
    "Hockus Pockus Wibbly Wobbly JoySt1ck",
    "Flibber Flubber Thingy",
    "Microz0ft YBox Controlla"
];
/* spell-checker: enable */

describe("Gamepad model detection", () => {
    describe("detects XInput/XBox controllers", () => {
        xboxModels.forEach((str) => {
            it(`given the string "${str}"`, () => {
                const model = GamepadModel.fromString(str);
                expect(model.style).toBe(GamepadStyle.XBOX);
            });
        });
    });
    describe("detects PlayStation-like controllers", () => {
        psModels.forEach((str) => {
            it(`given the string "${str}"`, () => {
                const model = GamepadModel.fromString(str);
                expect(model.style).toBe(GamepadStyle.PLAYSTATION);
            });
        });
    });
    describe("detects Google Stadia controllers", () => {
        stadiaModels.forEach((str) => {
            it(`given the string "${str}"`, () => {
                const model = GamepadModel.fromString(str);
                expect(model.style).toBe(GamepadStyle.STADIA);
            });
        });
    });
    describe("reports unknown unknown controllers", () => {
        unknownModels.forEach((str) => {
            it(`given the string "${str}"`, () => {
                const model = GamepadModel.fromString(str);
                expect(model.style).toBe(GamepadStyle.UNKNOWN);
            });
        });
    });
});

describe("Default gamepad model", () => {
    it("should be 'unknown'", () => {
        expect(DEFAULT_GAMEPAD_MODEL).not.toBeNull;
        expect(DEFAULT_GAMEPAD_MODEL.style).toBe(GamepadStyle.UNKNOWN);
    });
});
