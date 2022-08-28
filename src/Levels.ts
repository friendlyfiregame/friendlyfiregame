import { asset } from "./Assets";
import { getImageData } from "./graphics";
import overworldJSON from "../assets/maps/level.json";
import { MapInfo } from "./MapInfo";
import { GameScene } from "./scenes/GameScene";

export type LevelId = "overworld";

export type LevelData = {
  id: LevelId;
  mapInfo: MapInfo;
};

export class Levels {
  /** OVERWORLD MAP */
  @asset("maps/level.png")
  private static overworldForeground: HTMLImageElement;

  @asset("maps/level_collision.png", {
    map: (image: HTMLImageElement) => new Uint32Array(getImageData(image).data.buffer)
  })
  private static overworldCollisionMap: Uint32Array;

  @asset(["maps/bg.png", "maps/bg2.png", "maps/bg3.png"])
  private static overworldBackgrounds: HTMLImageElement[];

  private gameScene: GameScene;
  private levelData: LevelData[];

  public constructor(gameScene: GameScene) {
    this.gameScene = gameScene;

    this.levelData = [
      {
        id: "overworld",
        mapInfo: new MapInfo(overworldJSON, this.gameScene, "overworld", Levels.overworldForeground, Levels.overworldCollisionMap, Levels.overworldBackgrounds)
      }
    ];
  }

  public getAllLevels (): LevelData[] {
    return this.levelData;
  }

  public getLevelData (id: LevelId): LevelData {
    const level = this.levelData.find(l => l.id === id);
    if (!level) throw new Error(`Level of id ${id} not found`);
    return level;
  }
}