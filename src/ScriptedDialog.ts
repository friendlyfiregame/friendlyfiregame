import { NPC } from './NPC';
import { ScriptedDialogJSON, DialogJSON } from "../assets/dummy.texts.json";
import { SpeechBubble } from './SpeechBubble';
import { rndItem } from './util';
import { Campaign, CampaignState } from './Campaign';
import { GameObject, Game } from './game';

export class ScriptedDialog implements GameObject {
    public get hasPlayerDialog(): boolean {
        return !!this.currentMatchingDialog;
    }
    public currentMatchingDialog: DialogJSON | null = null;

    public greetingRange = 120;
    private get currentGreeting () {
        return this.speechBubble.message;
    }
    private set currentGreeting(message: string) {
        this.speechBubble.setMessage(message);
    }
    private currentMatchingGreetings: string[] = [];
    private greetingActive = false;
    /* used to prevent multiple greetings, e.g after a dialog has ended */
    private greetingAlreadyShown = false;

    private speechBubble = new SpeechBubble(
        this.game,
        this.npc.x,
        this.npc.y,
        "white"
    );

    private dialogActive = false;

    public get campaign(): Campaign {
        return this.npc.game.campaign;
    }

    constructor(private game: Game, public npc: NPC, private dialogData: ScriptedDialogJSON) {
        this.updateMatchingData(this.campaign.states);
        this.campaign.statesChanged$.subscribe(this.updateMatchingData.bind(this))
    }

    async load() {
    }

    public draw(ctx: CanvasRenderingContext2D) {
        if (this.greetingActive && this.currentGreeting !== "") {
            this.speechBubble.draw(ctx);
        }
    }

    public update(dt: number) {
        this.speechBubble.update(this.npc.x, this.npc.y);
        const isInRange = this.npc.game.player.distanceTo(this.npc) < this.greetingRange;
        if (isInRange && !this.greetingActive && !this.greetingAlreadyShown && !this.dialogActive) {
            this.setRandomGreeting();
            this.greetingActive = this.greetingAlreadyShown = true;
        } else if (!isInRange) {
            this.closeAllSpeechBubbles();
            this.greetingAlreadyShown = false;
        }
    }

    public closeAllSpeechBubbles() {
        this.dialogActive = false;
        this.greetingActive = false;
    }

    private setRandomGreeting() {
        if (this.currentMatchingGreetings.length > 0) {
            this.currentGreeting = rndItem(this.currentMatchingGreetings);
        } else {
            this.currentGreeting = "";
        }
    }

    private updateMatchingData(states: CampaignState[]) {
        const matchingGreetingSelector = this.findMatchingSelectorByStates(this.dialogData.greetings, states);
        if (matchingGreetingSelector) {
            this.currentMatchingGreetings = this.dialogData.greetings[matchingGreetingSelector];
            this.setRandomGreeting();
        } else {
            this.greetingActive = false;
            this.currentMatchingGreetings = [];
        }
        const matchingDialogSelector = this.findMatchingSelectorByStates(this.dialogData.dialogs, states);
        if (matchingDialogSelector) {
            this.currentMatchingDialog = this.dialogData.dialogs[matchingDialogSelector];
        } else {
            this.currentMatchingDialog = null
            this.dialogActive = false;
        }
    }

    private findMatchingSelectorByStates(data: {[key: string]: any}, currentCampaignStates: CampaignState[]): string | null {
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
function containsArray(arr1: any[], arr2: any[]) {
    return arr2.every(value => arr1.indexOf(value) !== -1);
}
