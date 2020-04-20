import { Subject } from 'rxjs';
import { Game } from './game';
import { NPC } from './NPC';
import { FaceModes } from './Face';
import fire1  from '../assets/dialog/fire1.dialog.json';
import stone1  from '../assets/dialog/stone1.dialog.json';
import tree1  from '../assets/dialog/tree1.dialog.json';
import { Conversation } from './Conversation';

export type CampaignState = "start" | "finished";

const allDialogs: Record<string, JSON> = {
    "fire1": fire1,
    "stone1": stone1,
    "tree1": tree1
};

export class Campaign {
    public statesChanged$ = new Subject<CampaignState[]>();
    public states: CampaignState[] = ["start"];

    constructor(public game: Game) {
        setTimeout(() => {
            this.begin();
        });
    }

    private begin() {
        // Setup initial NPC dialogs
        this.runAction("enable", null, ["fire", "fire1"]);
        this.runAction("enable", null, ["tree", "tree1"]);
        this.runAction("enable", null, ["stone", "stone1"]);
    }

    public hasState(state: CampaignState) {
        return this.states.includes(state);
    }

    public setStates(states: CampaignState[]) {
        this.states = states;
        this.statesChanged$.next(this.states);
    }

    public removeState(state: CampaignState) {
        if (this.hasState(state)) {
            this.states.splice(this.states.indexOf(state), 1);
            this.statesChanged$.next(this.states);
        }
    }

    public addState(state: CampaignState) {
        if (!this.hasState(state)) {
            this.states.push(state);
            this.statesChanged$.next(this.states);
        }
    }

    public runAction(action: string, npc?: NPC | null, params: string[] = []): void {
        switch(action) {
            case "angry":
                npc?.face?.setMode(FaceModes.ANGRY);
                break;
            case "neutral":
                npc?.face?.setMode(FaceModes.NEUTRAL);
                break;
            case "bored":
                npc?.face?.setMode(FaceModes.BORED);
                break;
            case "amused":
                npc?.face?.setMode(FaceModes.AMUSED);
                break;
            case "sad":
                npc?.face?.setMode(FaceModes.SAD);
                break;

            case "zoomin":
                this.game.camera.zoom += 1
                break;
            case "zoomout":
                this.game.camera.zoom -= 1
                break;

            case "game":
                this.addState(params[0] as any);
                break;
            case "multijump":
                this.game.player.multiJump = true;
                break;
            case "enable":
                const char = params[0], dialogName = params[1];
                const npcMap: Record<string, NPC> = {
                    "fire": this.game.fire,
                    "stone": this.game.stone,
                    "tree": this.game.tree
                };
                const targetNpc = npcMap[char];
                const dialog = allDialogs[dialogName];
                if (targetNpc && dialog) {
                    targetNpc.conversation = new Conversation(dialog, targetNpc);
                }
                break;
            case "disable":
                const char1 = params[0];
                const npcMap1: Record<string, NPC> = {
                    "fire": this.game.fire,
                    "stone": this.game.stone,
                    "tree": this.game.tree
                };
                const targetNpc1 = npcMap1[char1];
                console.log(char1, targetNpc1);
                if (targetNpc1) {
                    targetNpc1.conversation = null;
                }
                break;
        }
    }
}
