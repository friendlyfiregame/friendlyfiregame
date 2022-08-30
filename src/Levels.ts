import { asset } from "./Assets";
import { getImageData } from "./graphics";
import overworldJSON from "../assets/maps/overworld/level.json";
import testmapJSON from "../assets/maps/testmap/level.json";
import { MapInfo } from "./MapInfo";
import { GameScene } from "./scenes/GameScene";

export type LevelId = "overworld" | "testmap";

export type LevelData = {
  id: LevelId;
  mapInfo: MapInfo;
};

export class Levels {
  /** OVERWORLD MAP */
  @asset("maps/overworld/level.png")
  private static overworldForeground: HTMLImageElement;

  @asset("maps/overworld/collision.png", {
    map: (image: HTMLImageElement) => new Uint32Array(getImageData(image).data.buffer)
  })
  private static overworldCollisionMap: Uint32Array;

  @asset(["maps/overworld/bg.png", "maps/overworld/bg2.png", "maps/overworld/bg3.png"])
  private static overworldBackgrounds: HTMLImageElement[];

  /** TEST MAP */
  @asset("maps/testmap/level.png")
  private static testmapForeground: HTMLImageElement;

  @asset("maps/testmap/collision.png", {
    map: (image: HTMLImageElement) => new Uint32Array(getImageData(image).data.buffer)
  })
  private static testmapCollisionMap: Uint32Array;

  private gameScene: GameScene;
  private levelData: LevelData[];

  public constructor(gameScene: GameScene) {
    this.gameScene = gameScene;

    this.levelData = [
      {
        id: "overworld",
        mapInfo: new MapInfo(overworldJSON, this.gameScene, "overworld", Levels.overworldForeground, Levels.overworldCollisionMap, Levels.overworldBackgrounds)
      },
      {
        id: "testmap",
        mapInfo: new MapInfo(testmapJSON, this.gameScene, "testmap", Levels.testmapForeground, Levels.testmapCollisionMap, Levels.overworldBackgrounds)
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