import { Entity, entity, type EntityArgs } from "../Entity";
import { type AmbientSoundId } from "../scenes/AmbientSoundId";
import { calculateVolume } from "../util";
import { type Sound } from "./Sound";

export interface SoundEmitterArgs extends EntityArgs {
    sound?: string | Sound | null;
    volume?: number;
    intensity?: number;
}

/**
 * Sound emitters are invisible entities that emit a sound in relation to the player distance.
 * Might be better to set the volume according to the camera center in the future.
 */
@entity("water_sound") // TODO Use class name property in tiled map to reference this entity with one name
@entity("wind_sound")
export class SoundEmitter extends Entity {
    private readonly sound: Sound;
    private readonly volume: number;
    private readonly intensity: number;

    public constructor({ scene, sound = null, volume = 1, intensity = 1, ...args }: SoundEmitterArgs) {
        super({ scene, ...args, width: 1, height: 1 });

        if (sound != null) {
            if (typeof sound === "string") {
                const soundId = sound;
                sound = scene.ambientSounds[soundId as AmbientSoundId];
                if (sound == null) {
                    throw new Error(`Cannot create sound emitter because '${soundId}' is not a valid ambient sound ID.`);
                }
                this.sound = sound;
            }
            this.sound = sound;
        } else {
            throw new Error("Cannot create sound emitter because 'sound' property is empty.");
        }
        this.volume = volume;
        this.intensity = intensity;
    }

    public override draw(): void {
        // Intentionally left empty.
    }

    public override update(): void {
        const vol = this.scene.paused ? 0 : calculateVolume(
            this.distanceToPlayer, this.volume, this.intensity
        );

        if (vol) {
            this.sound.setVolume(vol);

            if (!this.sound.isPlaying()) this.sound.play();
        } else {
            this.sound.stop();
        }
    }
}
