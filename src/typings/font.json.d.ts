declare module "*.font.json" {
    export interface FontJSON {
        image: string;
        characterMapping: Record<string, string | number | string[]>[]
        margin: number;
        colors: Record<string, string>;
    }

    const value: FontJSON;
    export default value;
}
