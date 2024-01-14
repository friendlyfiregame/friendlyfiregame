// See https://gamepad-tester.com/controllers for a list of some possible controller IDs.

import { GamepadStyle } from "./GamepadStyle";

const typemap: Map<RegExp,GamepadStyle> = new Map();

/* spell-checker: disable */

// Virtual touch gamepad which was inspired by and resembles the Stadia overlay (more or less).
typemap.set(/^Cat Hive Virtual Touch Controller$/i, GamepadStyle.STADIA);

typemap.set(/^.*?(xinput).*$/i, GamepadStyle.XBOX);
// Vendor ID of Microsoft Corp.
typemap.set(/^.*(?<vendorId>045e).*$/i, GamepadStyle.XBOX);
// Vendor ID of Valve
typemap.set(/^.*(?<vendorId>28de).*$/i, GamepadStyle.XBOX);
// Anything with "stadia controller" in its name
typemap.set(/^.*?(stadia\ controller).*$/i, GamepadStyle.STADIA);
// Anything with playstation in its name
typemap.set(/^.*?(playstation).*$/i, GamepadStyle.PLAYSTATION);
// Vendor ID of Sony Inc.
typemap.set(/^.*(?<vendorId>054c).*$/i, GamepadStyle.PLAYSTATION);

// Anything with "snes" in it's name.
typemap.set(/snes/i, GamepadStyle.SNES);
// A certain no-name gamepad that I happen to own.
typemap.set(/^.*vendor:\s*?(?<vendorId>0810)\s*product:\s*?(?<groupId>e501)/i, GamepadStyle.SNES);

/**
 * Regular expression to extract vendor and product identifier.
 */
const productAndVendorMatcher = /^.*?vendor:?\s*(?<vendorId>.{4}).*?product:?\s*(?<productId>.{4}).*$/i;
/* spell-checker: enable */

export class GamepadModel {

    readonly #vendorId: number|undefined;
    readonly #productId: number|undefined;

    constructor(public style: GamepadStyle, vendorId?: number|undefined, productId?: number|undefined) {
        this.#vendorId = vendorId;
        this.#productId = productId;
    }

    public get vendorId(): number|undefined {
        return this.#vendorId;
    }

    public get productId(): number|undefined {
        return this.#productId;
    }

    /**
     * Parses a gamepad identifier string and returns an object that encapsulates
     * @param str
     *   Gamepad identifier string as reported by the Gamepad API.
     */
    public static fromString(str: string): GamepadModel {
        for (const [key, value] of typemap) {
            if (key.exec(str)) {
                const productAndVendorMatch = productAndVendorMatcher.exec(str);
                let vendorId: string | undefined;
                let productId: string | undefined;
                if (productAndVendorMatch !== null) {
                    vendorId = productAndVendorMatch.groups?.vendorId;
                    productId = productAndVendorMatch.groups?.productId;
                }
                return new GamepadModel(value, parseInt(vendorId || "-1", 16), parseInt(productId || "-1"));
            }
        }
        // Nothing matches? Well,... that's bad luck...
        return DEFAULT_GAMEPAD_MODEL;
    }

}

export const DEFAULT_GAMEPAD_MODEL: GamepadModel = new GamepadModel(GamepadStyle.UNKNOWN);
