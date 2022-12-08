declare module "*.dialog.json" {
    export type DialogJSON = Record<string, string[]>;
    const value: DialogJSON;
    export default value;
}
