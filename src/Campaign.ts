import caveman1 from "../assets/dialog/caveman1.dialog.json";
import caveman2 from "../assets/dialog/caveman2.dialog.json";
import { Conversation } from "./Conversation";
import type { DialogJSON } from "*.dialog.json";
import { FaceModes } from "./Face";
import fire0 from "../assets/dialog/fire0.dialog.json";
import fire1 from "../assets/dialog/fire1.dialog.json";
import fire2 from "../assets/dialog/fire2.dialog.json";
import fire3 from "../assets/dialog/fire3.dialog.json";
import fire4 from "../assets/dialog/fire4.dialog.json";
import flameboy1 from "../assets/dialog/flameboy1.dialog.json";
import flameboy2 from "../assets/dialog/flameboy2.dialog.json";
import flameboy3 from "../assets/dialog/flameboy3.dialog.json";
import flameboy4 from "../assets/dialog/flameboy4.dialog.json";
import { Game } from "./Game";
import { GameScene } from "./scenes/GameScene";
import goose1 from "../assets/dialog/goose1.dialog.json";
import gooseDead from "../assets/dialog/gooseDead.dialog.json";
import { NPC } from "./entities/NPC";
import powershiba2 from "../assets/dialog/powershiba2.dialog.json";
import { Quest, QuestA, QuestATrigger, QuestB, QuestKey, QuestC, QuestD, QuestE } from "./Quests";
import seed1 from "../assets/dialog/seed1.dialog.json";
import shadowpresence1 from "../assets/dialog/shadowpresence1.dialog.json";
import shadowpresenceChaos1 from "../assets/dialog/shadowpresenceChaos1.dialog.json";
import shiba1 from "../assets/dialog/shiba1.dialog.json";
import shiba2 from "../assets/dialog/shiba2.dialog.json";
import shiba3 from "../assets/dialog/shiba3.dialog.json";
import shiba4 from "../assets/dialog/shiba4.dialog.json";
import shiba5 from "../assets/dialog/shiba5.dialog.json";
import { Signal } from "./Signal";
import spider1 from "../assets/dialog/spider1.dialog.json";
import stone1 from "../assets/dialog/stone1.dialog.json";
import stone2 from "../assets/dialog/stone2.dialog.json";
import stonedisciple1 from "../assets/dialog/stonedisciple1.dialog.json";
import stonedisciple2 from "../assets/dialog/stonedisciple2.dialog.json";
import tree0 from "../assets/dialog/tree0.dialog.json";
import tree1 from "../assets/dialog/tree1.dialog.json";
import tree2 from "../assets/dialog/tree2.dialog.json";
import { valueCurves } from "./Particles";
import wing1 from "../assets/dialog/wing1.dialog.json";
import wingChaos1 from "../assets/dialog/wingChaos1.dialog.json";

export type CampaignState = "start" | "finished";

const allDialogs: Record<string, DialogJSON> = {
    "caveman1": caveman1,
    "caveman2": caveman2,
    "fire0": fire0,
    "fire1": fire1,
    "fire2": fire2,
    "fire3": fire3,
    "fire4": fire4,
    "stone1": stone1,
    "stone2": stone2,
    "stonedisciple1": stonedisciple1,
    "stonedisciple2": stonedisciple2,
    "seed1": seed1,
    "tree0": tree0,
    "tree1": tree1,
    "tree2": tree2,
    "shiba1": shiba1,
    "shiba2": shiba2,
    "shiba3": shiba3,
    "shiba4": shiba4,
    "shiba5": shiba5,
    "powershiba2": powershiba2,
    "spider1": spider1,
    "flameboy1": flameboy1,
    "flameboy2": flameboy2,         
    "flameboy3": flameboy3,
    "flameboy4": flameboy4,
    "wing1": wing1,
    "wingChaos1": wingChaos1,
    "shadowpresence1": shadowpresence1,
    "shadowpresenceChaos1": shadowpresenceChaos1,
    "goose1": goose1,
    "gooseDead": gooseDead
};

export enum CharacterAsset {
    FEMALE, MALE, PATIENT
}

export enum VoiceAsset {
    FEMALE, MALE
}

export class Campaign {
    public onStatesChanged = new Signal<CampaignState[]>();
    public states: CampaignState[] = ["start"];
    public readonly quests = [
        new QuestA(this),
        new QuestB(this),
        new QuestC(this),
        new QuestD(this),
        new QuestE(this)
    ];
    public gameScene?: GameScene | undefined;

    public selectedCharacter = CharacterAsset.FEMALE;
    public selectedVoice = VoiceAsset.FEMALE;
    public isNewGamePlus = false;

    constructor(public game: Game) {}

    public getQuest(key: QuestKey): Quest {
        const ending = this.quests.find(ending => ending.key === key);
        if (!ending) throw new Error(`Cannot find quest with key ${key}`);
        return ending;
    }

    public setNewGamePlus (isNewGamePlus: boolean) {
        this.isNewGamePlus = isNewGamePlus;
    }

    public toggleCharacterAsset(): void {
        this.selectedCharacter = this.selectedCharacter === CharacterAsset.MALE ? CharacterAsset.FEMALE : CharacterAsset.MALE;
    }

    public toggleVoiceAsset(): void {
        this.selectedVoice = this.selectedVoice === VoiceAsset.MALE ? VoiceAsset.FEMALE : VoiceAsset.MALE;
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
        });

        this.getQuest(QuestKey.A).trigger(QuestATrigger.JUST_ARRIVED);

        // Setup initial NPC dialogs
        this.runAction("enable", null, ["caveman", "caveman1"]);
        this.runAction("enable", null, ["fire", "fire0"]);
        this.runAction("enable", null, ["tree", "tree0"]);
        this.runAction("enable", null, ["stone", "stone1"]);
        this.runAction("enable", null, ["stonedisciple", "stonedisciple1"]);
        this.runAction("enable", null, ["flameboy", "flameboy1"]);
        this.runAction("enable", null, ["goose", "goose1"]);
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
            switch (action) {
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
                    this.gameScene.camera.zoom += 1;
                    break;
                case "zoomout":
                    this.gameScene.camera.zoom -= 1;
                    break;
                case "treezoom":
                    const forestPointer = this.gameScene.pointsOfInterest.find(poi => poi.name === "forest");

                    if (forestPointer) {
                        this.gameScene.camera.focusOn(
                            8,
                            forestPointer.x, forestPointer.y,
                            1,
                            0,
                            valueCurves.cos(0.35)
                        );
                    }

                    break;
                case "mountainzoom":
                    const mountainPointer = this.gameScene.pointsOfInterest.find(poi => poi.name === "mountain");

                    if (mountainPointer) {
                        this.gameScene.camera.focusOn(
                            8,
                            mountainPointer.x, mountainPointer.y,
                            1,
                            0,
                            valueCurves.cos(0.35)
                        );
                    }

                    break;
                case "riverzoom":
                    const riverPointer = this.gameScene.pointsOfInterest.find(poi => poi.name === "river");

                    if (riverPointer) {
                        this.gameScene.camera.focusOn(
                            8,
                            riverPointer.x, riverPointer.y,
                            1,
                            0,
                            valueCurves.cos(0.35)
                        );
                    }

                    break;
                case "crazyzoom":
                    this.getQuest(QuestKey.A).trigger(QuestATrigger.APOCALYPSE_STARTED);
                    const duration = 12;

                    this.gameScene.camera.focusOn(
                        duration,
                        this.gameScene.fire.x, this.gameScene.fire.y + 15,
                        8,
                        -2 * Math.PI, valueCurves.cubic
                    ).then(() => this.gameScene!.beginApocalypse());

                    this.gameScene.fire.conversation = null;
                    this.gameScene.fireFuryEndTime = this.gameScene.gameTime + duration + 8;
                    break;
                case "friendshipEnding":
                    this.gameScene.beginFriendshipEnding();
                    break;
                case "activatefireportal":
                    this.gameScene.exitPortal.activate();
                    this.gameScene.flameboy.nextState();
                    break;
                case "talkedtofire":
                    this.getQuest(QuestKey.A).trigger(QuestATrigger.TALKED_TO_FIRE);
                    break;
                case "giveWoodToFlameboy":
                    Conversation.setGlobal("gaveWoodToFlameboy", "true");
                    this.gameScene.setGateDisabled("exitportaldoor_1", false);
                    this.gameScene.player.removeMultiJump();
                    this.gameScene.removeGameObject(this.gameScene.fire);
                    this.gameScene.removeGameObject(this.gameScene.shiba);
                    this.gameScene.removeGameObject(this.gameScene.powerShiba);
                    this.gameScene.removeGameObject(this.gameScene.bird);
                    this.gameScene.removeGameObject(this.gameScene.shadowPresence);
                    this.gameScene.removeGameObject(this.gameScene.tree);
                    this.gameScene.removeGameObject(this.gameScene.wing);
                    this.gameScene.removeGameObject(this.gameScene.mimic);
                    this.gameScene.removeGameObject(this.gameScene.stone);
                    this.gameScene.removeGameObject(this.gameScene.stoneDisciple);

                    this.runAction("enable", null, ["flameboy", "flameboy3"]);
                    break;
                case "giveBone":
                    Conversation.setGlobal("gaveBoneToPowerShiba", "true");
                    this.runAction("enable", null, ["shiba", "shiba3"]);
                    this.runAction("enable", null, ["powershiba", "powershiba2"]);
                    break;
                case "shibaNextState":
                    this.gameScene.shiba.nextState();
                    break;
                case "talkedtotree":
                    this.getQuest(QuestKey.A).trigger(QuestATrigger.TALKED_TO_TREE);
                    break;
                case "gotFireQuest":
                    this.getQuest(QuestKey.A).trigger(QuestATrigger.GOT_QUEST_FROM_FIRE);
                    Conversation.setGlobal("gotFireQuest", "true");
                    this.runAction("enable", null, ["tree", "tree1"]);
                    break;
                case "endgameA":
                    this.getQuest(QuestKey.A).trigger(QuestATrigger.BEAT_GAME);
                    this.getQuest(QuestKey.A).finish();
                    this.gameScene.fire.conversation = null;
                    this.gameScene.gameOver();
                    break;
                case "endgameB":
                    this.getQuest(QuestKey.B).finish();
                    this.gameScene.fire.conversation = null;
                    this.gameScene.gameOver();
                    break;
                case "endgameC":
                    this.getQuest(QuestKey.C).finish();
                    this.gameScene.caveman.conversation = null;
                    this.gameScene.gameOver();
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
                case "friendship":
                    this.gameScene.player.enableFriendship();
                    break;
                case "choas":
                    this.gameScene.player.enableChaos();
                    break;
                case "collectWeirdThrow":
                    this.gameScene.superThrow.pickupAgainstWill();
                    break;
                case "collectFlying":
                    this.gameScene.wing.pickupAgainstWill();
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
                case "wakeupchest":
                    this.gameScene.mimic.nextState();
                    break;
                case "petDoggo":
                    this.gameScene.beginPetEnding();
                    break;
                case "lookThroughWindow":
                    this.gameScene.beginWindowEnding();
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
                        "goose": this.gameScene.goose,
                        "wing": this.gameScene.wing,
                        "caveman": this.gameScene.caveman,
                        "shadowpresence": this.gameScene.shadowPresence,
                        "shiba": this.gameScene.shiba,
                        "powershiba": this.gameScene.powerShiba
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
                        "caveman": this.gameScene.caveman,
                        "shadowpresence": this.gameScene.shadowPresence,
                        "shiba": this.gameScene.shiba,
                        "powershiba": this.gameScene.powerShiba
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
