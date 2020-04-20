import { Subject } from 'rxjs';
import { Game } from './game';
import { NPC } from './NPC';
import { FaceModes } from './Face';

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

    constructor(public game: Game) {
    }

    public runAction(action: string, npc?: NPC, params: string[] = []): void {
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
        }
    }
}
