import { Campaign } from "./Campaign";

export enum QuestKey {
    A = "questA",
    B = "questB",
    C = "questC",
    D = "questD",
    E = "questE"
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
    ENDING_TRIGGERED
}

export enum QuestCTrigger {
    ENDING_TRIGGERED
}

export enum QuestDTrigger {
    ENDING_TRIGGERED
}

export enum QuestETrigger {
    ENDING_TRIGGERED
}

type TriggerDefinition = {
    index: number;
    isTriggered: boolean;
};

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

    public reset(): void {
        this.finished = false;
        this.triggers.forEach((t, i) => { this.untrigger(i); });
    }

    public trigger(index: number): void {
        if (this.triggers[index] != null) {
            this.triggers[index].isTriggered = true;
        }
    }

    public untrigger(index: number): void {
        if (this.triggers[index] != null) {
            this.triggers[index].isTriggered = false;
        }
    }

    public getTriggers(): TriggerDefinition[] {
        return this.triggers;
    }

    public isTriggered(index: number): boolean {
        return this.triggers[index].isTriggered || false;
    }

    public allTriggered(): boolean {
        return this.triggers.every(trigger => trigger.isTriggered);
    }

    public getHighestTriggerIndex(): number {
        return Math.max(...this.triggers.filter(t => t.isTriggered).map(t => t.index), -1);
    }

    public finish(): void {
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
    public constructor(campaign: Campaign) {
        super(
            QuestKey.A,
            campaign,
            "[A]POCALYPSE NOT NOW",
            Object.values(QuestATrigger).filter((i): i is number => typeof i === "number")
        );
    }
}

/**
 * Ending B. Helped Dog and Beat fire
 */
export class QuestB extends Quest {
    public constructor(campaign: Campaign) {
        super(
            QuestKey.B,
            campaign,
            "GOOD [B]OY",
            Object.values(QuestBTrigger).filter((i): i is number => typeof i === "number")
        );
    }
}

/**
 * Ending C. Sequence broken and soft locked in cave
 */
export class QuestC extends Quest {
    public constructor(campaign: Campaign) {
        super(
            QuestKey.C,
            campaign,
            "SOFT LO[C]KED",
            Object.values(QuestCTrigger).filter((i): i is number => typeof i === "number")
        );
    }
}


/**
 * Ending D. Petted the dog for quite some time and transcended
 */
export class QuestD extends Quest {
    public constructor(campaign: Campaign) {
        super(
            QuestKey.D,
            campaign,
            "[D]ROWNED IN ECSTASY",
            Object.values(QuestDTrigger).filter((i): i is number => typeof i === "number")
        );
    }
}

/**
 * Ending E. Awoke in outer space and realized the awful truth
 */
export class QuestE extends Quest {
    public constructor(campaign: Campaign) {
        super(
            QuestKey.E,
            campaign,
            "AWAK[E]",
            Object.values(QuestETrigger).filter((i): i is number => typeof i === "number")
        );
    }
}
