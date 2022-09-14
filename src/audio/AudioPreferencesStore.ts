export interface AudioPreferencesStore {
    getMusicGain(): Promise<number>;
    setMusicGain(volume: number): Promise<void>;
    getSfxGain(): Promise<number>;
    setSfxGain(volume: number): Promise<void>;
}
