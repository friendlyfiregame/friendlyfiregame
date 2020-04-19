import { Subject } from 'rxjs';
import { Game } from './game';

export type CampaignState = "start" | "finished"

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

    public runAction(action: string) {
        switch(action) {
            case "finishGame":
                this.addState("finished");
                break;
        }
    }
}
