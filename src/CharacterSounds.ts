import { asset } from "./Assets";
import { VoiceAsset } from "./Campaign";
import { Sound } from "./Sound";
import { rndItem } from "./util";

export type CharacterSoundType = "jump" | "drown" | "land" | "throw";
type SoundDataStructure = Record<VoiceAsset, Record<CharacterSoundType, Sound[]>>;

export class CharacterSounds  {
  /** Low Pitch */
  @asset(["sounds/jumping/jumping.mp3"])
  public static lowPitchJump: Sound[];

  @asset(["sounds/drowning/drowning.mp3"])
  private static lowPitchDrown: Sound[];

  @asset(["sounds/jumping/landing.mp3"])
  private static lowPitchLand: Sound[];

  @asset(["sounds/throwing/throwing.mp3"])
  private static lowPitchThrow: Sound[];

  /** High Pitch */
  @asset([
    "sounds/jumping/jump_female_01.ogg"
  ])
  private static highPitchJump: Sound[];

  @asset(["sounds/drowning/drowning.mp3"])
  private static highPitchDrown: Sound[];

  @asset(["sounds/jumping/landing.mp3"])
  private static highPitchLand: Sound[];

  @asset(["sounds/throwing/throwing.mp3"])
  private static highPitchThrow: Sound[];

  public static getSoundData (): SoundDataStructure {
    return {
      [VoiceAsset.MALE]: {
        "jump": CharacterSounds.lowPitchJump,
        "drown": CharacterSounds.lowPitchDrown,
        "land": CharacterSounds.lowPitchLand,
        "throw": CharacterSounds.lowPitchThrow
      },
      [VoiceAsset.FEMALE]: {
        "jump": CharacterSounds.highPitchJump,
        "drown": CharacterSounds.highPitchDrown,
        "land": CharacterSounds.highPitchLand,
        "throw": CharacterSounds.highPitchThrow
      },
    };
  }


  private static getRandomCharacterSound(type: CharacterSoundType, voice: VoiceAsset): Sound | undefined {
    return rndItem(CharacterSounds.getSoundData()[voice][type]);
  }

  public static playRandomCharacterSound (type: CharacterSoundType, voice: VoiceAsset): void {
    CharacterSounds.stopCharacterSound(type, voice);
    const randomSound = CharacterSounds.getRandomCharacterSound(type, voice);
    if (randomSound) {
      randomSound.play();
    }
  }

  public static stopCharacterSound (type: CharacterSoundType, voice: VoiceAsset): void {
    const sounds = CharacterSounds.getSoundData()[voice][type];
    sounds.forEach(s => s.stop());
  }
}
