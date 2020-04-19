import { Subject } from 'rxjs';
import { Game } from './game';
import { NPC } from './NPC';

export type CampaignState = "start" | "finished";

export class Campaign {
    public statesChanged$ = new Subject<CampaignState[]>();
    public states: CampaignState[] = ["start"];

    public hasState(state: CampaignState) {
        return this.states.includes(state);
    }

    public setStates(states: CampaignState[]) {
        this.states = states;
        this.statesChanged$.next(this.states);
    }

    public addState(state: CampaignState) {
        if (this.hasState(state)) {
            this.states.splice(this.states.indexOf(state), 1);
            this.statesChanged$.next(this.states);
        }
    }

    public removeState(state: CampaignState) {
        if (!this.hasState(state)) {
            this.states.push(state);
            this.statesChanged$.next(this.states);
        }
    }

    constructor(public game: Game) {
    }

    public runAction(action: string, npc?: NPC, params: string[] = []): void {
        switch(action) {
            case "finishGame":
                this.addState("finished");
                break;
        }
    }

    public async startPlayerDialogWithNPC(npc: NPC) {
        this.game.player.dialogActive = true;
        this.game.player.speechBubble.setMessage("heeey");
        // TODO modify focus to stop focus on a callback
        await this.game.camera.focusOn(10, npc.x, npc.y);
        this.game.player.dialogActive = false;
    }
}
