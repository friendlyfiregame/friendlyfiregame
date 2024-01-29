import { Entity, type EntityArgs } from "../Entity";
import { type GameObjectInfo } from "../MapInfo";
import { type AmbientSoundId } from "../scenes/AmbientSoundId";
import { type GameScene } from "../scenes/GameScene";
import { calculateVolume } from "../util";
import { type Sound } from "./Sound";

export interface SoundEmitterArgs extends EntityArgs {
    sound: Sound;
    maxVolume: number;
    intensity: number;
}

/**
 * Sound emitters are invisible entities that emit a sound in relation to the player distance.
 * Might be better to set the volume according to the camera center in the future.
 */
export class SoundEmitter extends Entity {
    private readonly sound: Sound;
    private readonly maxVolume: number;
    private readonly intensity: number;

    public constructor({ sound, maxVolume, intensity, ...args }: SoundEmitterArgs) {
        super({ ...args, width: 1, height: 1 });

        this.sound = sound;
        this.maxVolume = maxVolume;
        this.intensity = intensity;
    }

    public override draw(): void {
        // Intentionally left empty.
    }

    public override update(): void {
        const vol = this.scene.paused ? 0 : calculateVolume(
            this.distanceToPlayer, this.maxVolume, this.intensity
        );

        if (vol) {
            this.sound.setVolume(vol);

            if (!this.sound.isPlaying()) this.sound.play();
        } else {
            this.sound.stop();
        }
    }

    public static fromGameObjectInfo(
        scene: GameScene, gameObjectInfo: GameObjectInfo
    ): SoundEmitter {
        const soundId = gameObjectInfo.properties.sound;
        const volume = gameObjectInfo.properties.volume ?? 1;
        const intensity = gameObjectInfo.properties.intensity ?? 1;

        if (soundId != null) {
            const sound = scene.ambientSounds[soundId as AmbientSoundId];

            if (sound != null) {
                return new SoundEmitter({
                    scene,
                    x: gameObjectInfo.x,
                    y: gameObjectInfo.y,
                    sound,
                    maxVolume: volume,
                    intensity
                });
            } else {
                throw new Error(
                    `Cannot create sound emitter because '${soundId}' is not a valid ambient sound ID.`
                );
            }
        } else {
            throw new Error("Cannot create sound emitter because 'sound' property is empty.");
        }
    }
}
