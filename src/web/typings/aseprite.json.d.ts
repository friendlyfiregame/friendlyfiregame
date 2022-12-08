declare module "*.aseprite.json" {
    export type AsepriteFormat = "I8" | "RGBA8888";
    export type AsepriteBlendMode = "normal" | "darken" | "multiply" | "color_burn" | "lighten" | "screen"
        | "color_dodge" | "addition" | "overlay" | "soft_light" | "hard_light" | "difference" | "exclusion"
        | "subtract" | "divide" | "hue" | "saturation" | "color" | "luminosity";
    export type AsepriteDirection = "forward" | "reverse" | "pingpong";

    export interface AsepriteSizeJSON {
        w: number;
        h: number;
    }

    export interface AsepritePointJSON {
        x: number;
        y: number;
    }

    export interface AsepriteRectJSON extends AsepriteSizeJSON, AsepritePointJSON {}

    export interface AsepriteLayerJSON {
        name: string;
        opacity?: number;
        blendMode?: AsepriteBlendMode;
        color?: string;
        data?: string;
        group?: string;
    }

    export interface AsepriteFrameTagJSON {
        name: string;
        from: number;
        to: number;
        direction: AsepriteDirection;
    }

    export interface AsepriteSliceKeyJSON {
        frame: number;
        bounds: AsepriteRectJSON;
        center: AsepriteRectJSON;
        pivot: AsepritePointJSON;
    }

    export interface AsepriteSliceJSON {
        name: string;
        color: string;
        keys: AsepriteSliceKeyJSON[];
    }

    export interface AsepriteMetaJSON {
        app: string;
        version: string;
        image: string;
        format: AsepriteFormat;
        size: AsepriteSizeJSON;
        scale: string;
        frameTags?: AsepriteFrameTagJSON[];
        layers?: AsepriteLayerJSON[];
        slices?: AsepriteSliceJSON[];
    }

    export interface AsepriteFrameJSON {
        filename?: string;
        frame: AsepriteRectJSON;
        rotated: boolean;
        trimmed: boolean;
        spriteSourceSize: AsepriteRectJSON;
        sourceSize: AsepriteSizeJSON;
        duration: number;
    }

    export interface AsepriteJSON {
        frames: Record<string, AsepriteFrameJSON> | AsepriteFrameJSON[];
        meta: AsepriteMetaJSON;
    }

    const value: AsepriteJSON;
    export default value;
}
