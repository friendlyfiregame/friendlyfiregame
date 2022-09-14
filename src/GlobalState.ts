import { QuestKey } from "./Quests";

enum GlobalStateKey {
  BEAT_GAME_ONCE = "beatGame",
  ACHIEVED_ENDINGS = "achievedEndings"
}

export class GlobalState {
  private static getParsedValueByKey<T> (key: GlobalStateKey, fallback: T): T {
    const serialized = localStorage.getItem(key);
    if (serialized) {
      try {
        const parsed = JSON.parse(serialized) as T;
        return parsed || fallback;
      } catch (e) {
        console.error(e);
        return fallback;
      }
    } else {
      return fallback;
    }
  }

  private static setKeyValuePair<T> (key: GlobalStateKey, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (e) {
      console.error(e);
    }
  }

  public static getHasBeatenGame (): boolean {
    return GlobalState.getParsedValueByKey<boolean>(GlobalStateKey.BEAT_GAME_ONCE, false);
  }

  public static setHasBeatenGame (): void {
    GlobalState.setKeyValuePair<boolean>(GlobalStateKey.BEAT_GAME_ONCE, true);
  }

  public static getAchievedEndings (): QuestKey[] {
    return GlobalState.getParsedValueByKey<QuestKey[]>(GlobalStateKey.ACHIEVED_ENDINGS, []);
  }

  public static setAchievedEnding (questKey: QuestKey): void {
    const achievedEndings = GlobalState.getParsedValueByKey<QuestKey[]>(GlobalStateKey.ACHIEVED_ENDINGS, []);
    if (!achievedEndings.includes(questKey)) {
      achievedEndings.push(questKey);
      GlobalState.setKeyValuePair<QuestKey[]>(GlobalStateKey.ACHIEVED_ENDINGS, achievedEndings);
    }
  }

}
