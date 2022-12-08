import { contextBridge, ipcRenderer } from "electron";
import type { SteamworksApi } from "../shared/SteamworksApi";
import type { FullscreenManager } from "../shared/FullscreenManager";

// cSpell:disable
const steamworks: SteamworksApi = {
    available: true,
    initialized: async () => ipcRenderer.invoke("steamworks", ["", "initialized"]),
    localplayer: {
        getName: async () => ipcRenderer.invoke("steamworks", ["localplayer", "getName"]),
        getSteamId: async () => ipcRenderer.invoke("steamworks", ["localplayer", "getSteamId"])
    },
    achievement: {
        isActivated: async (achievementId) => ipcRenderer.invoke("steamworks", ["achievement", "isActivated", achievementId]),
        activate: async (achievementId) => ipcRenderer.invoke("steamworks", ["achievement", "activate", achievementId])
    },
    cloud: {
        isEnabledForApp: async () => ipcRenderer.invoke("steamworks", ["cloud", "isEnabledForApp"]),
        isEnabledForAccount: async () => ipcRenderer.invoke("steamworks", ["cloud", "isEnabledForAccount"]),
        readFile: async (name) => ipcRenderer.invoke("steamworks", ["cloud", "readFile", name]),
        writeFile: async (name, content) => ipcRenderer.invoke("steamworks", ["cloud", "writeFile", name, content]),
        deleteFile: async (name) => ipcRenderer.invoke("steamworks", ["cloud", "deleteFile", name])
    }
};

const fullscreenPreferencesStore: FullscreenManager = {
    isEnabled: async () => ipcRenderer.invoke("preferences", ["fullscreen", "isEnabled"]),
    setEnabled: async (enabled) => ipcRenderer.invoke("preferences", ["fullscreen", "setEnabled", enabled])
};

function init(): void {
    contextBridge.exposeInMainWorld("steamworks", steamworks);
    contextBridge.exposeInMainWorld("fullscreen", fullscreenPreferencesStore);
}

process.once("loaded", init);
