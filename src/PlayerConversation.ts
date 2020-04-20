import { Conversation, Interaction } from './Conversation';
import { Player } from './Player';
import { NPC } from './NPC';

export class PlayerConversation {
    private interaction: Interaction | null = null;
    private selectedOption = -1;

    constructor(
        private readonly player: Player,
        private readonly npc: NPC,
        private readonly conversation: Conversation
    ) {
        this.interaction = this.conversation.getNextInteraction();
        this.setSelectedOption(0);
        this.setBubblesContent();
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

    private setBubblesContent() {
        if (this.interaction) {
            const optionsTexts = this.interaction.options.map(options => options.line)
            if (optionsTexts.length > 0) {
                this.player.speechBubble.setOptions(optionsTexts);
                this.player.speechBubble.show();
            }
            if (this.interaction.npcLine) {
                this.npc.speechBubble.setMessage(this.interaction.npcLine.line);
                this.npc.speechBubble.show();
            }
        }
    }

    private setSelectedOption(num = 0): number {
        if (this.interaction && this.interaction.options && this.interaction.options.length > 0) {
            let sel = num % this.interaction.options.length;
            if (sel < 0) { sel += this.interaction.options.length; }
            this.selectedOption = sel;
        } else {
            this.selectedOption = -1;
        }
        this.player.speechBubble.selectedOptionIndex = this.selectedOption;
        return this.selectedOption;
    }

    public handleKey(e: KeyboardEvent) {
        if (!e.repeat) {
            // Enter to proceed
            if (e.key == "Enter" || e.key == "e") {
                this.proceed();
            }
            const upDown = (["s", "ArrowDown"].includes(e.key) ? 1 : 0) - (["w", "ArrowUp"].includes(e.key) ? 1 : 0);
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
            this.interaction = this.conversation.getNextInteraction();
            this.setBubblesContent();
        } else {
            this.endConversation();
        }
    }

    private endConversation() {
        this.player.playerConversation = null;
        this.player.speechBubble.hide();
        this.npc.speechBubble.hide();
    }
}
