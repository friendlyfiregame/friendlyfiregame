import { Campaign, CampaignState } from "./Campaign";
import { GameObject, GameScene } from "./scenes/GameScene";
import { NPC } from "./entities/NPC";
import { rndItem } from "./util";
import { ScriptedDialogJSON } from "../../assets/dummy.texts.json";
import { SpeechBubble } from "./SpeechBubble";

export class Greeting implements GameObject {
    public greetingRange = 120;
    private currentMatchingGreetings: string[] = [];
    private greetingActive = false;

    // Used to prevent multiple greetings, e.g. after a dialog has ended.
    private greetingAlreadyShown = false;

    private readonly speechBubble = new SpeechBubble(this.scene, this.npc.x, this.npc.y);

    public constructor(private readonly scene: GameScene, public npc: NPC, private readonly dialogData: ScriptedDialogJSON) {
        this.updateMatchingData(this.campaign.states);
        this.campaign.onStatesChanged.connect(this.updateMatchingData, this);
    }

    public get dialogActive(): boolean {
        return !!this.scene.player.playerConversation;
    }

    public get campaign(): Campaign {
        return this.scene.game.campaign;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.greetingActive) {
            this.speechBubble.draw(ctx);
        }
    }

    public update(): void {
        this.speechBubble.update(this.npc.x, this.npc.y);
        const isInRange = this.npc.scene.player.distanceTo(this.npc) < this.greetingRange;

        if (
            isInRange
            && !this.greetingActive
            && !this.greetingAlreadyShown
            && !this.dialogActive
        ) {
            this.setRandomGreeting();
            this.greetingActive = this.greetingAlreadyShown = true;
            this.speechBubble.show();
        } else if (!isInRange) {
            this.greetingActive = false;
            this.greetingAlreadyShown = false;
            this.speechBubble.hide();
        }
    }

    private setRandomGreeting(): void {
        const message = this.currentMatchingGreetings.length > 0 ? rndItem(this.currentMatchingGreetings) : "";
        void this.speechBubble.setMessage(message);
    }

    private updateMatchingData(states: CampaignState[]): void {
        const matchingGreetingSelector = this.findMatchingSelectorByStates(this.dialogData.greetings, states);

        if (matchingGreetingSelector != null) {
            this.currentMatchingGreetings = this.dialogData.greetings[matchingGreetingSelector];
            this.setRandomGreeting();
        } else {
            this.greetingActive = false;
            this.currentMatchingGreetings = [];
        }
    }

    private findMatchingSelectorByStates(
        data: {[key: string]: unknown}, currentCampaignStates: CampaignState[]
    ): string | null {
        const stateSelectors: string[][] = [];

        for (const key in data) {
            stateSelectors.push(key.split(" "));
        }

        let bestMatchingSelector: string | null = null;

        // search for highest selector "specificity" first
        stateSelectors.sort((a, b) => { return b.length - a.length; });

        for (const selector of stateSelectors) {
            if (containsArray(currentCampaignStates, selector)) {
                bestMatchingSelector = selector.join(" ");
                break;
            }
        }

        return bestMatchingSelector;
    }
}

/* returns true when arr2 is contained in arr1 */
function containsArray(arr1: unknown[], arr2: unknown[]): boolean {
    return arr2.every(value => arr1.indexOf(value) !== -1);
}
