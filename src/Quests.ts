import { Campaign } from './Campaign';

export enum QuestKey {
  A = 'questA',
  B = 'questB'
}

export enum QuestATrigger {
  JUST_ARRIVED,
  TALKED_TO_FIRE,
  GOT_QUEST_FROM_FIRE,
  GOT_RUNNING_ABILITY,
  TALKED_TO_TREE,
  GOT_QUEST_FROM_TREE,
  GOT_SEED,
  PLANTED_SEED,
  TALKED_TO_STONE,
  GOT_STONE,
  THROWN_STONE_INTO_WATER,
  GOT_MULTIJUMP,
  LEARNED_RAIN_DANCE,
  MADE_RAIN,
  TREE_DROPPED_WOOD,
  GOT_WOOD,
  TALKED_TO_FIRE_WITH_WOOD,
  THROWN_WOOD_INTO_FIRE,
  APOCALYPSE_STARTED,
  BEAT_FIRE,
  BEAT_GAME
}

export enum QuestBTrigger {
  FLAMEBOY_CORRUPTED,
  WING_CORRUPTED,
  TREE_CORRUPTED,
  FIRE_CORRUPTED,
  SPIDER_CORRUPTED,
  SEED_CORRUPTED,
  STONE_CORRUPTED
}

type TriggerDefinition = {
  index: number;
  isTriggered: boolean;
}

export abstract class Quest {
  public readonly key: QuestKey;
  public readonly campaign: Campaign;
  protected readonly triggers: TriggerDefinition[] = [];
  public readonly title: string;
  private finished = false;

  public constructor(key: QuestKey, campaign: Campaign, title: string, triggerIndices: number[]) {
    this.key = key;
    this.campaign = campaign;
    this.title = title;
    this.triggers = triggerIndices.map(index => ({
      index,
      isTriggered: false
    }));
  }

  public reset (): void {
    this.finished = false;
    this.triggers.forEach((t, i) => { this.unTrigger(i) })
  }

  public trigger(index: number) {
    if (this.triggers[index]) {
      this.triggers[index].isTriggered = true;
    }
  }

  public unTrigger(index: number) {
    if (this.triggers[index]) {
      this.triggers[index].isTriggered = false;
    }
  }

  public getTriggers (): TriggerDefinition[] {
    return this.triggers;
  }

  public isTriggered (index: number): boolean {
    return this.triggers[index].isTriggered || false;
  }

  public allTriggered (): boolean {
    return this.triggers.every(trigger => trigger.isTriggered);
  }

  public getHighestTriggerIndex (): number {
    return Math.max(...this.triggers.filter(t => t.isTriggered).map(t => t.index), -1);
  }

  public finish() {
    this.finished = true;
  }
  public isFinished(): boolean {
    return this.finished;
  }
}

/**
 * Standard Ending A. Follow the questline and beat the fire at the end
 */
export class QuestA extends Quest {
  public constructor (campaign: Campaign) {
    super(
      QuestKey.A,
      campaign,
      '[A]pocalypse not now',
      Object.values(QuestATrigger).filter((i):i is number => typeof i === 'number')
    );
  }
}

/**
 * Ending B. Meet cave man and corrupt all npcs to end game
 */
export class QuestB extends Quest {
  public constructor (campaign: Campaign) {
    super(
      QuestKey.B,
      campaign,
      'Stuck [B]etween worlds',
      Object.values(QuestBTrigger).filter((i):i is number => typeof i === 'number')
    );
  }
}