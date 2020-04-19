import { NPC } from './NPC';
import texts, { ScriptedDialogJSON } from "../assets/dummy.texts.json";
import { SpeechBubble } from './SpeechBubble';
import { Vector2, rndItem } from './util';
import { Campaign, CampaignState } from './Campaign';

export class ScriptedDialog {
    public static Texts = texts;

    public greetingRange = 120;
    public greetingOffset: Vector2 = {x: 0, y: 40};
    private currentGreeting: string = "";
    private validGreetings: string[] = [];
    private greetingActive = false;
    /* used to prevent multiple greetings, e.g after a dialog has ended */
    private greetingAlreadyShown = false;
    private greetingBubble: SpeechBubble;

    private dialogActive = false;

    public get campaign(): Campaign {
        return this.npc.game.campaign;
    }

    constructor(public npc: NPC, private dialogData: ScriptedDialogJSON) {
        this.updateGreetings(this.campaign.states);
        this.greetingBubble = new SpeechBubble(
            this.npc.game,
            this.npc.x + this.greetingOffset.x,
            this.npc.y + this.greetingOffset.y,
            "white",
            this.currentGreeting
        );
        this.campaign.statesChanged$.subscribe(this.updateGreetings.bind(this))
    }

    public draw(ctx: CanvasRenderingContext2D) {
        if (this.greetingActive && this.currentGreeting !== "") {
            this.greetingBubble.message = this.currentGreeting;
            this.greetingBubble.draw(ctx, this.npc.x + this.greetingOffset.x, this.npc.y + this.greetingOffset.y);
        }
    }

    public update(dt: number) {
        const isInRange = this.npc.game.player.distanceTo(this.npc) < this.greetingRange;
        if (isInRange && !this.greetingActive && !this.greetingAlreadyShown && !this.dialogActive) {
            this.greetingActive = this.greetingAlreadyShown = true;
        } else if (!isInRange) {
            this.closeAllSpeechBubbles();
            this.greetingAlreadyShown = false;
            this.setRandomGreeting();
        }
    }

    public closeAllSpeechBubbles() {
        this.dialogActive = false;
        this.greetingActive = false;
    }

    private setRandomGreeting() {
        if (this.validGreetings.length > 0) {
            this.currentGreeting = rndItem(this.validGreetings);
        } else {
            this.currentGreeting = "";
        }
    }

    private updateGreetings(states: CampaignState[]) {
        const greetingStates: string[][] = [];
        for (const key in this.dialogData.greetings) {
            greetingStates.push(key.split(" "));
        }

        let validGreetings: string[] = [];

        greetingStates.sort((a, b) => { return b.length - a.length; });
        for (const greetingState of greetingStates) {
            if (containsArray(greetingState, states)) {
                validGreetings = this.dialogData.greetings[greetingState.join(" ")];
                break;
            }
        }
        // when no high specifity state is found, sort by least specifity and use the first found value
        if (validGreetings.length === 0) {
            greetingStates.sort((a, b) => { return a.length - b.length; });
            for (const greetingState of greetingStates) {
                if (containsArray(greetingStates, states)) {
                    validGreetings = this.dialogData.greetings[greetingState.join(" ")];
                    break;
                }
            }
        }

        this.validGreetings = validGreetings;
        this.setRandomGreeting();
    }
}

/* returns true when arr1 is contained in arr2 */
function containsArray(arr1: any[], arr2: any[]) {
    return arr1.every(value => arr2.includes(value));
}
