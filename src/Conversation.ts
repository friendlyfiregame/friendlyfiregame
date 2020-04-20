import { NPC } from './NPC';

interface Interaction {
    npcLine: ConversationLine | null;
    options: ConversationLine[];
    spoiledOptions: ConversationLine[];
};

export class Conversation {
    private states: string[];
    private data: {[key: string]: ConversationLine[]};
    private state!: string;
    private stateIndex = 0;

    constructor(json: any, private readonly npc: NPC) {
        this.states = Object.keys(json);
        this.data = {};
        for (const state of this.states) {
            this.data[state] = json[state].map((line: string) => new ConversationLine(line, this));
        }
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
        if (line && line.isNpc) {
            result.npcLine = line;
        }
        // Does Player react?
        let option = this.getNextLine();
        while (option && !option.isNpc) {
            // TODO identify spoiled options (that don't lead to anything new for the player) and sort accordingly
            result.options.push(option);
            option = this.getNextLine();
        }
        if (option) {
            this.goBack();
        }
        return result;
    }

    public runAction(action: string[]) {
        this.npc.game.campaign.runAction(action[0], this.npc, action.slice(1));
    }

    private goBack() {
        this.stateIndex--;
    }

    private getNextLine(): ConversationLine | null {
        if (this.stateIndex >= this.data[this.state].length) {
            return null;
        }
        return this.data[this.state][this.stateIndex++];
    }
}

export class ConversationLine {
    public readonly line: string;
    public readonly targetState: string | null;
    public readonly actions: string[][];
    public readonly isNpc: boolean;
    private visited = false;

    constructor(
        public readonly full: string,
        public readonly conversation: Conversation
    ) {
        this.line = ConversationLine.extractText(full);
        this.targetState = ConversationLine.extractState(full);
        this.actions = ConversationLine.extractActions(full);
        this.isNpc = !full.startsWith(">");
        this.visited = false;
    }

    public execute() {
        this.visited = true;
        if (this.targetState != null) {
            this.conversation.setState(this.targetState);
        }
        if (this.actions.length > 0) {
            for (const action of this.actions) {
                this.conversation.runAction(action);
            }
        }
    }

    public wasVisited(): boolean {
        return this.visited;
    }

    private static extractText(line: string): string {
        // Remove player option sign
        if (line.startsWith(">")) { line = line.substr(1); }
        // Remove actions and state changes
        const atPos = line.indexOf("@"), exclPos = line.search(/\![a-z]/);
        if (atPos >= 0 || exclPos >= 0) {
            return line.substr(0, Math.min(atPos, exclPos));
        }
        return line;
    }

    private static extractState(line: string): string | null {
        const stateChanges = line.match(/(@[a-z]+)/g);
        if (stateChanges && stateChanges.length > 0) {
            const stateName = stateChanges[0].substr(1);
            return stateName;
        }
        return null;
    }

    private static extractActions(line: string): string[][] {
        const actions = line.match(/(\![a-z][a-z ]*)+/g);
        const result = [];
        if (actions) {
            for (const action of actions) {
                const segments = action.substr(1).split(" ");
                result.push(segments);
            }
        }
        return result;
    }
}
