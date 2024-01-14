import { ControllerEvent } from "./input/ControllerEvent";
import { Conversation, Interaction } from "./Conversation";
import { MenuList } from "./Menu";
import { NPC } from "./entities/NPC";
import { Player } from "./entities/Player";

export class PlayerConversation {
    private interaction: Interaction | null = null;
    private selectedOption = -1;

    public constructor(
        private readonly player: Player,
        public readonly npc: NPC,
        private readonly conversation: Conversation,
        private readonly autoMove = true
    ) {
        this.interaction = this.conversation.getNextInteraction();
        this.setSelectedOption(0);
        this.setBubblesContent();
        this.interaction?.npcLine?.executeBeforeLine();
        npc.meet();

        // Ensure safe distance to NPC
        if (this.autoMove) {
            const minDis = 20;

            if (Math.abs(player.x - npc.x) < minDis) {
                if (player.x < npc.x) {
                    player.startAutoMove(npc.x - minDis, true);
                } else {
                    player.startAutoMove(npc.x + minDis, true);
                }
            }
        }
    }

    /**
     * Returns true if conversation has been terminated (one way or the other)
     */
    public update(): boolean {
        if (!this.interaction || this.conversation.hasEnded()) {
            if (this.player.playerConversation != null) {
                this.endConversation();
            }

            return true;
        }

        this.player.scene.camera.setCinematicBar(1);

        return false;
    }

    private setBubblesContent(): void {
        if (this.interaction) {
            const optionsTexts = this.interaction.options.map(options => options.line);

            if (this.interaction.npcLine) {
                void this.npc.speechBubble.setMessage(this.interaction.npcLine.line);
                this.npc.speechBubble.show();
            }

            if (optionsTexts.length > 0) {
                this.setSelectedOption(0);
                this.player.speechBubble.setOptions(optionsTexts, this.npc.speechBubble);
                this.player.speechBubble.show();
            }
        }
    }

    private setSelectedOption(num = 0): number {
        if (this.interaction != null && this.interaction.options != null && this.interaction.options.length > 0) {
            let sel = num % this.interaction.options.length;

            if (sel < 0) {
                sel += this.interaction.options.length;
            }

            this.selectedOption = sel;
        } else {
            this.selectedOption = -1;
        }

        this.player.speechBubble.selectedOptionIndex = this.selectedOption;

        return this.selectedOption;
    }

    public handleButton(e: ControllerEvent): void {
        if (e.isAbort && !e.isPause) {
            this.endConversation();
        } else if (!e.repeat) {
            // Enter to proceed
            if (e.isConfirm) {
                this.proceed();
            }

            const upDown = (e.isMenuDown ? 1 : 0) - (e.isMenuUp ? 1 : 0);

            if (upDown !== 0) {
                MenuList.click.stop();
                MenuList.click.play();
                this.setSelectedOption(this.selectedOption + upDown);
            }
        }
    }

    private proceed(): void {
        if (this.interaction) {
            if (this.npc.speechBubble.isCurrentlyWriting || this.npc.speechBubble.preventUnwantedSelection) {
                this.npc.speechBubble.isCurrentlyWriting = false;
                return;
            }

            const options = this.interaction.options;

            if (options != null && options.length > 0) {
                // Player could choose between options, confirmed with Enter
                const index = (options.length === 1) ? 0 : this.selectedOption;
                const option = options[index];

                if (option != null) {
                    MenuList.select.play();
                    option.execute();
                } else {
                    console.error(
                        "Tried to execute invalid option at index " + index
                        + " in interaction around line: " + this.interaction.npcLine
                    );
                }
            }

            if (this.interaction.npcLine) {
                MenuList.click.stop();
                MenuList.click.play();
                // NPC said something, player proceeds without any options
                this.interaction.npcLine.execute();
            }

            this.interaction = this.conversation.getNextInteraction();
            this.setSelectedOption(-1);
            this.setBubblesContent();
        }

        if (!this.interaction) {
            this.endConversation();
        } else {
            if (this.interaction.npcLine) {
                // Mostly NPCs execute actions at the beginning of their line, not afterwards
                this.npc.face?.setMode(this.npc.defaultFaceMode);
                this.interaction.npcLine.executeBeforeLine();
            }
        }
    }

    private endConversation(): void {
        this.player.playerConversation = null;
        this.player.speechBubble.hide();
        this.npc.speechBubble.hide();
        this.npc.registerEndedConversation();
    }
}
