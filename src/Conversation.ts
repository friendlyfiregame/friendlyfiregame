import { NPC } from './NPC';

interface Interaction {
    npcLine: string | null;
    options: string[];
    spoiledOptions: string[];
};

export class Conversation {
    private states: string[];
    private data: {[key: string]: string[]};
    private state!: string;
    private stateIndex = 0;

    constructor(json: JSON, private readonly npc: NPC) {
        this.states = Object.keys(json);
        this.data = <any>json;
        this.setState("entry");
    }

    public setState(name = "entry") {
        if (!this.states.includes(name)) {
            throw new Error("State name " + name + " does not exist in conversation");
        }
        this.state = name;
        this.stateIndex = 0;
    }

    public getNextInteraction(): Interaction | null {
        const result: Interaction = {
            npcLine: null,
            options: [],
            spoiledOptions: []
        };
        // Does NPC speak?
        const line = this.getNextLine()
        if (line == null) {
            // Conversation is over without changing state or anything
            return null;
        }
        if (line && this.isLineByNPC(line)) {
            result.npcLine = line;
        }
        // Does Player react?
        let option = this.getNextLine();
        while (option && this.isLineByPlayer(option)) {
            // TODO identify spoiled options (that don't lead to anything new for the player) and sort accordingly
            result.options.push(option);
            option = this.getNextLine();
        }
        if (option) {
            this.goBack();
        }
        return result;
    }

    public extractText(line: string): string {
        // Remove player option sign
        if (line.startsWith(">")) { line = line.substr(1); }
        // Remove actions and state changes
        const atPos = line.indexOf("@"), exclPos = line.search(/\![a-z]/);
        if (atPos >= 0 || exclPos >= 0) {
            return line.substr(0, Math.min(atPos, exclPos));
        }
        return line;
    }

    public executeLine(line: string): void {
        const stateChanges = line.match(/(@[a-z]+)/g);
        const actions = line.match(/(\![a-z][a-z ]*)+/g);
        if (stateChanges && stateChanges.length > 0) {
            // Jump to state
            const stateName = stateChanges[0].substr(1);
            this.setState(stateName);
        }
        if (actions) {
            for (const action of actions) {
                const segments = action.substr(1).split(" ");
                this.npc.game.campaign.runAction(segments[0], this.npc, segments.slice(1));
            }
        }
    }

    private goBack() {
        this.stateIndex--;
    }

    private getNextLine(): string | null {
        if (this.stateIndex >= this.data[this.state].length) {
            return null;
        }
        return this.data[this.state][this.stateIndex++];
    }

    private isLineByNPC(line: string) {
        return !this.isLineByPlayer(line);
    }

    private isLineByPlayer(line: string) {
        return line.startsWith(">");
    }
}
