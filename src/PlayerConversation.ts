import { Player } from './Player';
import { Conversation, Interaction } from './Conversation';

export class PlayerConversation {
    private interaction: Interaction | null = null;
    private selectedOption = -1;

    constructor(
        private readonly player: Player,
        private readonly conversation: Conversation
    ) {
        this.interaction = this.conversation.getNextInteraction();
        this.selectedOption = -1;
    }

    /**
     * Returns true if conversation has been terminated (one way or the other)
     */
    public update(dt: number): boolean {
        if (!this.interaction) {
            return true;
        }

        return false;
    }

    public draw(ctx: CanvasRenderingContext2D) {

    }

    private setSelectedOption(num = 0): number {
        if (this.interaction && this.interaction.options && this.interaction.options.length > 0) {
            let sel = (this.selectedOption + num) % this.interaction.options.length;
            if (sel < 0) { sel += this.interaction.options.length; }
            this.selectedOption = sel;
        } else {
            this.selectedOption = -1;
        }
        return this.selectedOption;
    }

    public handleKey(e: KeyboardEvent) {
        if (!e.repeat) {
            // Enter to proceed
            if (e.key == "Enter") {
                this.proceed();
            }
            const upDown = (["D", "ArrowDown"].includes(e.key) ? 1 : 0) - (["W", "ArrowUp"].includes(e.key) ? 1 : 0);
            if (upDown !== 0) {
                this.setSelectedOption(this.selectedOption + upDown);
            }
        }
    }

    private proceed() {
        if (this.interaction) {
            const options = this.interaction.options;
            if (options && options.length > 0) {
                // Player could choose between options, confirmed with Enter
                const index = (options.length === 1) ? 0 : this.selectedOption;
                const option = options[index];
                if (option) {
                    option.execute();
                } else {
                    console.error("Tried to execute invalid option at index " + index + " in interaction around line: "
                            + this.interaction.npcLine);
                }
            } else if (this.interaction.npcLine) {
                // NPC said something, player proceeds without any options
                this.interaction.npcLine.execute();
            }
            this.interaction = this.conversation .getNextInteraction();
        }
    }
}
