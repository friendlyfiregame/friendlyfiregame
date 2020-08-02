declare module "*.font.json" {
    export interface FontJSON {
        image: string;
        characterMapping: Record<string, number>[]
        margin: number;
        colors: Record<string, string>;
    }

    const value: FontJSON;
    export default value;
}
