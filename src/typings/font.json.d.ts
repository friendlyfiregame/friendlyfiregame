declare module "*.font.json" {
    export interface FontJSON {
        image: string;
        characters: string;
        widths: number[];
        margin: number;
        colors: Record<string, string>;
    }

    const value: FontJSON;
    export default value;
}
