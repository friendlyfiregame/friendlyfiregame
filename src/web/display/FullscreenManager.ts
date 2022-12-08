import type { FullscreenManager as IFullscreenManager } from "../../shared/FullscreenManager";
import { WebFullscreenManager } from "./WebFullscreenManager";

export type FullscreenManager = IFullscreenManager;
export namespace FullscreenManager {
    export const getInstance = (): IFullscreenManager => fullscreenManager;
}

const fullscreenManager: IFullscreenManager = (window as any)["fullscreen"] || new WebFullscreenManager();
