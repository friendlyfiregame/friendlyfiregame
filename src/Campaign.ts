import { Subject } from 'rxjs';
import { Game } from './game';
import { NPC } from './NPC';
import { FaceModes } from './Face';
import fire1 from '../assets/dialog/fire1.dialog.json';
import fire2 from '../assets/dialog/fire2.dialog.json';
import fire3 from '../assets/dialog/fire3.dialog.json';
import stone1 from '../assets/dialog/stone1.dialog.json';
import stone2 from '../assets/dialog/stone2.dialog.json';
import seed1 from '../assets/dialog/seed1.dialog.json';
import tree1 from '../assets/dialog/tree1.dialog.json';
import tree2 from '../assets/dialog/tree2.dialog.json';
import flameboy1 from '../assets/dialog/flameboy1.dialog.json';
import flameboy2 from '../assets/dialog/flameboy2.dialog.json';
import wing1 from '../assets/dialog/wing1.dialog.json';
import { Conversation } from './Conversation';
import { valueCurves } from './Particles';

export type CampaignState = "start" | "finished";

const allDialogs: Record<string, JSON> = {
    "fire1": fire1,
    "fire2": fire2,
    "fire3": fire3,
    "stone1": stone1,
    "stone2": stone2,
    "seed1": seed1,
    "tree1": tree1,
    "tree2": tree2,
    "flameboy1": flameboy1,
    "flameboy2": flameboy2,
    "wing1": wing1,
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
        this.runAction("enable", null, ["flameboy", "flameboy1"]);
        this.runAction("enable", null, ["wing", "wing1"]);
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
        console.log(action);
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
            case "treezoom":
                console.log("yes yes");
                this.game.camera.focusOn(8, 3100, 500, 1, 0, valueCurves.cos(0.3));
                break;
            case "mountainzoom":
                this.game.camera.focusOn(8, 2052, 1625, 1, 0, valueCurves.cos(0.3));
                break;
            case "crazyzoom":
                const duration = 12;
                this.game.camera.focusOn(duration, this.game.fire.x, this.game.fire.y + 15, 8,
                    -2 * Math.PI, valueCurves.cubic).then(() => this.game.beginApocalypse());
                this.game.fire.conversation = null;
                this.game.fireFuryEndTime = this.game.gameTime + duration + 8;
                break;
            case "endgame":
                setTimeout(() => {
                    this.game.gameOver();
                }, 2000);
                break;

            case "game":
                this.addState(params[0] as any);
                break;
            case "doublejump":
                this.game.player.doubleJump = true;
                break;
            case "multijump":
                this.game.player.multiJump = true;
                break;
            case "spawnseed":
                this.game.tree.spawnSeed();
                break;
            case "spawnwood":
                this.game.tree.spawnWood();
                break;
            case "pickupstone":
                this.game.stone.pickUp();
                break;
            case "dance":
                setTimeout(() => {
                    this.game.player.startDance(+params[0] || 1);
                }, 500);
                break;
            case "enable":
                const char = params[0], dialogName = params[1];
                const npcMap: Record<string, NPC> = {
                    "fire": this.game.fire,
                    "stone": this.game.stone,
                    "tree": this.game.tree,
                    "seed": this.game.seed,
                    "flameboy": this.game.flameboy,
                    "wing": this.game.wing
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
                    "tree": this.game.tree,
                    "seed": this.game.seed,
                    "flameboy": this.game.flameboy,
                    "wing": this.game.wing
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
