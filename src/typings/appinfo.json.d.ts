declare module "appinfo.json" {
    export interface AppInfoJSON {
        version: string;
        gitCommitHash: string;
    }

    const value: AppInfoJSON;
    export default value;
}
