import { NPC } from './NPC';
import { FaceModes } from './Face';
import type { DialogJSON } from "*.dialog.json";
import caveman from '../assets/dialog/caveman.dialog.json';
import fire0 from '../assets/dialog/fire0.dialog.json';
import fire1 from '../assets/dialog/fire1.dialog.json';
import fire2 from '../assets/dialog/fire2.dialog.json';
import fire3 from '../assets/dialog/fire3.dialog.json';
import stone1 from '../assets/dialog/stone1.dialog.json';
import stone2 from '../assets/dialog/stone2.dialog.json';
import stonedisciple1 from '../assets/dialog/stonedisciple1.dialog.json';
import stonedisciple2 from '../assets/dialog/stonedisciple2.dialog.json';
import seed1 from '../assets/dialog/seed1.dialog.json';
import tree0 from '../assets/dialog/tree0.dialog.json';
import tree1 from '../assets/dialog/tree1.dialog.json';
import tree2 from '../assets/dialog/tree2.dialog.json';
import spider1 from '../assets/dialog/spider1.dialog.json';
import flameboy1 from '../assets/dialog/flameboy1.dialog.json';
import flameboy2 from '../assets/dialog/flameboy2.dialog.json';
import wing1 from '../assets/dialog/wing1.dialog.json';
import shadowpresence1 from '../assets/dialog/shadowpresence1.dialog.json';
import { Conversation } from './Conversation';
import { valueCurves } from './Particles';
import { Signal } from "./Signal";
import { GameScene } from "./scenes/GameScene";
import { QuestA, QuestB, QuestKey, Quest, QuestATrigger, QuestBTrigger } from './Quests';
import { Game } from './Game';

export type CampaignState = "start" | "finished";

const allDialogs: Record<string, DialogJSON> = {
    "caveman": caveman,
    "fire0": fire0,
    "fire1": fire1,
    "fire2": fire2,
    "fire3": fire3,
    "stone1": stone1,
    "stone2": stone2,
    "stonedisciple1": stonedisciple1,
    "stonedisciple2": stonedisciple2,
    "seed1": seed1,
    "tree0": tree0,
    "tree1": tree1,
    "tree2": tree2,
    "spider1": spider1,
    "flameboy1": flameboy1,
    "flameboy2": flameboy2,
    "wing1": wing1,
    "shadowpresence1": shadowpresence1,
};

export class Campaign {
    public onStatesChanged = new Signal<CampaignState[]>();
    public states: CampaignState[] = ["start"];
    public readonly quests = [
        new QuestA(this),
        new QuestB(this)
    ];
    public gameScene?: GameScene | undefined;

    constructor(public game: Game) {}

    public getQuest(key: QuestKey): Quest {
        const ending = this.quests.find(ending => ending.key === key);
        if (!ending) throw new Error(`Cannot find quest with key ${key}`);
        return ending;
    }

    /**
     * Init campaign. Assign Game Scene and enable all initial dialog trees
     * @param gameScene Game Scene
     */
    public begin(gameScene: GameScene) {
        this.gameScene = gameScene;

        // Rest quest progress
        this.quests.forEach(q => {
            q.reset();
        })

        this.getQuest(QuestKey.A).trigger(QuestATrigger.JUST_ARRIVED);

        // Setup initial NPC dialogs
        this.runAction("enable", null, ["caveman", "caveman"]);
        this.runAction("enable", null, ["fire", "fire0"]);
        this.runAction("enable", null, ["tree", "tree0"]);
        this.runAction("enable", null, ["stone", "stone1"]);
        this.runAction("enable", null, ["stonedisciple", "stonedisciple1"]);
        this.runAction("enable", null, ["flameboy", "flameboy1"]);
        this.runAction("enable", null, ["wing", "wing1"]);
        this.runAction("enable", null, ["spider", "spider1"]);
        this.runAction("enable", null, ["shadowpresence", "shadowpresence1"]);
    }

    public hasState(state: CampaignState) {
        return this.states.includes(state);
    }

    public setStates(states: CampaignState[]) {
        this.states = states;
        this.onStatesChanged.emit(this.states);
    }

    public removeState(state: CampaignState) {
        if (this.hasState(state)) {
            this.states.splice(this.states.indexOf(state), 1);
            this.onStatesChanged.emit(this.states);
        }
    }

    public addState(state: CampaignState) {
        if (!this.hasState(state)) {
            this.states.push(state);
            this.onStatesChanged.emit(this.states);
        }
    }

    /**
     * Run action is only allowed when active scene is GameScene
     * @param action - action string
     * @param npc    - targeted npc
     * @param params - params consisting of string array
     */
    public runAction(action: string, npc?: NPC | null, params: string[] = []): void {
        if (this.gameScene) {
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
                    this.gameScene.camera.zoom += 1
                    break;
                case "zoomout":
                    this.gameScene.camera.zoom -= 1
                    break;
                case "treezoom":
                    const forestPointer = this.gameScene.pointsOfInterest.find(poi => poi.name === 'forest');
                    if (forestPointer) {
                        this.gameScene.camera.focusOn(8, forestPointer.x, forestPointer.y, 1, 0, valueCurves.cos(0.35));
                    }
                    break;
                case "mountainzoom":
                    const mountainPointer = this.gameScene.pointsOfInterest.find(poi => poi.name === 'mountain');
                    if (mountainPointer) {
                        this.gameScene.camera.focusOn(8, mountainPointer.x, mountainPointer.y, 1, 0, valueCurves.cos(0.35));
                    }
                    break;
                case "riverzoom":
                    const riverPointer = this.gameScene.pointsOfInterest.find(poi => poi.name === 'river');
                    if (riverPointer) {
                        this.gameScene.camera.focusOn(8, riverPointer.x, riverPointer.y, 1, 0, valueCurves.cos(0.35));
                    }
                    break;
                case "crazyzoom":
                    this.getQuest(QuestKey.A).trigger(QuestATrigger.APOCALYPSE_STARTED);
                    const duration = 12;
                    this.gameScene.camera.focusOn(duration, this.gameScene.fire.position.x, this.gameScene.fire.position.y + 15, 8,
                        -2 * Math.PI, valueCurves.cubic).then(() => this.gameScene!.beginApocalypse());
                        this.gameScene.fire.conversation = null;
                        this.gameScene.fireFuryEndTime = this.gameScene.gameTime + duration + 8;
                    break;
                case  "talkedtofire":
                    this.getQuest(QuestKey.A).trigger(QuestATrigger.TALKED_TO_FIRE);
                    break;
                case  "talkedtotree":
                    this.getQuest(QuestKey.A).trigger(QuestATrigger.TALKED_TO_TREE);
                    break;
                case "gotFireQuest":
                    this.getQuest(QuestKey.A).trigger(QuestATrigger.GOT_QUEST_FROM_FIRE);
                    Conversation.setGlobal("gotFireQuest", "true");
                    this.runAction("enable", null, ["tree", "tree1"]);
                    break;
                case "givebeard":
                    // this.gameScene.player.setBeard(true);
                    break;
                case "endgame":
                    this.getQuest(QuestKey.A).trigger(QuestATrigger.BEAT_GAME);
                    this.getQuest(QuestKey.A).finish();
                    this.gameScene.fire.conversation = null;
                    this.gameScene!.gameOver();
                    break;

                case "game":
                    this.addState(params[0] as any);
                    break;
                case "enableRunning":
                    this.gameScene.player.enableRunning();
                    break;
                case "doublejump":
                    this.gameScene.player.enableDoubleJump();
                    break;
                case "multijump":
                    this.getQuest(QuestKey.A).trigger(QuestATrigger.GOT_MULTIJUMP);
                    this.gameScene.player.enableMultiJump();
                    break;
                case "spawnseed":
                    this.gameScene.tree.spawnSeed();
                    break;
                case "spawnwood":
                    this.getQuest(QuestKey.A).trigger(QuestATrigger.TREE_DROPPED_WOOD);
                    this.gameScene.tree.spawnWood();
                    break;
                case "talkedToStone":
                    if (this.getQuest(QuestKey.A).getHighestTriggerIndex() === QuestATrigger.PLANTED_SEED) {
                        this.getQuest(QuestKey.A).trigger(QuestATrigger.TALKED_TO_STONE);
                    }
                    break;
                case "pickupstone":
                    this.gameScene.stone.pickUp();
                    break;
                case "learnraindance":
                    this.gameScene.player.enableRainDance();
                    break;
                case "talkedToFireWithWood":
                    if (this.getQuest(QuestKey.A).getHighestTriggerIndex() === QuestATrigger.GOT_WOOD) {
                        this.getQuest(QuestKey.A).trigger(QuestATrigger.TALKED_TO_FIRE_WITH_WOOD);
                    }
                    break;
                case "dance":
                    setTimeout(() => {
                        this.gameScene!.player.startDance(+params[0] || 1);
                    }, 500);
                    break;
                case "togglegender":
                    this.gameScene.player.toggleGender();
                    break;
                case "corruptFlameboy":
                    this.getQuest(QuestKey.B).trigger(QuestBTrigger.FLAMEBOY_CORRUPTED);
                    break;
                case "wakeupchest":
                    this.gameScene.mimic.nextState();
                    break;
                case "enable":
                    const char = params[0], dialogName = params[1];
                    const npcMap: Record<string, NPC> = {
                        "fire": this.gameScene.fire,
                        "stone": this.gameScene.stone,
                        "stonedisciple": this.gameScene.stoneDisciple,
                        "tree": this.gameScene.tree,
                        "seed": this.gameScene.seed,
                        "flameboy": this.gameScene.flameboy,
                        "wing": this.gameScene.wing,
                        "spider": this.gameScene.spider,
                        "caveman": this.gameScene.caveman,
                        "shadowpresence": this.gameScene.shadowPresence
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
                        "fire": this.gameScene.fire,
                        "stone": this.gameScene.stone,
                        "stonedisciple": this.gameScene.stoneDisciple,
                        "tree": this.gameScene.tree,
                        "seed": this.gameScene.seed,
                        "flameboy": this.gameScene.flameboy,
                        "wing": this.gameScene.wing,
                        "spider": this.gameScene.spider,
                        "caveman": this.gameScene.caveman,
                        "shadowpresence": this.gameScene.shadowPresence
                    };
                    const targetNpc1 = npcMap1[char1];
                    if (targetNpc1) {
                        targetNpc1.conversation = null;
                    }
                    break;
            }
        }
    }
}
