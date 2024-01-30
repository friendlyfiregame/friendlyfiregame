import type { FixedWidthFontJSON, VariableWidthFontJSON } from "../BitmapFont";
declare module "*.font.json" {
    const value: FixedWidthFontJSON | VariableWidthFontJSON;
    export default value;
}
