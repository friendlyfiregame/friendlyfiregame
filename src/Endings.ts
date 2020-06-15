import { Campaign } from './Campaign';

export enum EndingATrigger {
  JUST_ARRIVED,
  TALKED_TO_FIRE,
  GOT_QUEST_FROM_FIRE,
  TALKED_TO_TREE,
  GOT_QUEST_FROM_TREE,
  GOT_SEED,
  PLANTED_SEED,
  TALKED_TO_STONE,
  GOT_STONE,
  THROWN_STONE_INTO_WATER,
  GOT_MULTIJUMP,
  MADE_RAIN,
  TREE_DROPPED_WOOD,
  GOT_WOOD,
  TALKED_TO_FIRE_WITH_WOOD,
  THROWN_WOOD_INTO_FIRE,
  APOCALYPSE_STARTED,
  BEAT_FIRE,
  BEAT_GAME
}

export enum EndingBTrigger {
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

export abstract class Ending {
  public name: string;
  public campaign: Campaign;
  protected triggers: TriggerDefinition[] = []

  public constructor(campaign: Campaign, name: string, triggerIndices: number[]) {
    this.name = name;
    this.campaign = campaign;
    this.triggers = triggerIndices.map(index => ({
      index,
      isTriggered: false
    }));
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
}

/**
 * Standard Ending A. Follow the questline and beat the fire at the end (Apocalypse)
 */
export class EndingA extends Ending {
  public constructor (campaign: Campaign, name: string) {
    const triggerIndices = Object.values(EndingATrigger).filter((i):i is number => typeof i === 'number')
    super(campaign, name, triggerIndices);
  }
}

/**
 * Ending B. Meet cave man and corrupt all npcs to end game ()
 */
export class EndingB extends Ending {
  public constructor (campaign: Campaign, name: string) {
    const triggerIndices = Object.values(EndingBTrigger).filter((i):i is number => typeof i === 'number')
    super(campaign, name, triggerIndices);
  }
}