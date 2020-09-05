import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { BitmapFont } from "../BitmapFont";
import { CharacterAsset, VoiceAsset } from "../Campaign";
import { ControllerAnimationTags } from "../input/ControllerFamily";
import { ControllerEvent } from "../input/ControllerEvent";
import { DIALOG_FONT } from "../constants";
import { easeOutCubic } from "../easings";
import { FriendlyFire } from "../FriendlyFire";
import { GameScene } from "./GameScene";
import { MenuItem, MenuList } from "../Menu";
import { Scene } from "../Scene";
import { SlideTransition } from "../transitions/SlideTransition";
import { TitleScene } from "./TitleScene";
import { ImageNode } from "../scene/ImageNode";
import { Direction } from "../geom/Direction";
import { TextNode } from "../scene/TextNode";
import { ControlTooltipNode } from "../scene/ControlTooltipNode";
import { AsepriteNode } from "../scene/AsepriteNode";

enum MenuItemKey {
    CHARACTER = "character",
    VOICE = "voice",
    START = "start"
}

const menuItemX = 12;
const characterMenuItemY = 20;
const voiceMenuItemY = 50;
const startMenuItemY = 124;
const selectionItemsYDistance = 12;
const selectionItemsXDistance = 12;

export class CharacterSelectionScene extends Scene<FriendlyFire> {
    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    @asset("fonts/credits.font.json")
    private static headlineFont: BitmapFont;

    @asset([
        "sprites/pc/female.aseprite.json",
        "sprites/pc/male.aseprite.json"
    ])
    public static playerSprites: Aseprite[];

    @asset("images/panel.png")
    private static panelImage: HTMLImageElement;

    private menu!: MenuList;
    private variant1!: TextNode;
    private variant2!: TextNode;
    private voice1!: TextNode;
    private voice2!: TextNode;
    private character!: AsepriteNode;

    public activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
        this.menu.onActivated.connect(this.handleMenuAction, this);
    }

    public deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
        this.menu.onActivated.disconnect(this.handleMenuAction, this);
    }

    public async handleMenuAction(buttonId: string): Promise<void> {
        switch (buttonId) {
            case MenuItemKey.CHARACTER:
                this.game.campaign.toggleCharacterAsset();
                this.updateSelection();
                break;
            case MenuItemKey.VOICE:
                this.game.campaign.toggleVoiceAsset();
                this.updateSelection();
                break;
            case MenuItemKey.START:
                await this.game.scenes.popScene({ noTransition: false });
                TitleScene.music.stop();
                this.game.scenes.setScene(GameScene);
        }
    }

    private async handleButtonDown(event: ControllerEvent): Promise<void> {
        if (event.isAbort) {
            this.scenes.popScene();
        } else if (event.isConfirm) {
            this.menu.executeAction();
        } else if (event.isMenuUp) {
            this.menu.prev();
        } else if (event.isMenuDown) {
            this.menu.next();
        }
    }

    private updateSelection(): void {
        if (this.game.campaign.selectedCharacter === CharacterAsset.MALE) {
            this.variant1.setColor("grey").setOutlineColor(null);
            this.variant2.setColor("white").setOutlineColor("black");
        } else {
            this.variant1.setColor("white").setOutlineColor("black");
            this.variant2.setColor("grey").setOutlineColor(null);
        }

        if (this.game.campaign.selectedVoice === VoiceAsset.MALE) {
            this.voice1.setColor("grey").setOutlineColor(null);
            this.voice2.setColor("white").setOutlineColor("black");
        } else {
            this.voice1.setColor("white").setOutlineColor("black");
            this.voice2.setColor("grey").setOutlineColor(null);
        }

        this.character.setAseprite(CharacterSelectionScene.playerSprites[this.game.campaign.selectedCharacter]);
    }

    public setup(): void {
        this.setBackgroundStyle("rgba(0, 0, 0, 0.8)");

        this.zIndex = 2;
        this.inTransition = new SlideTransition({ duration: 0.5, direction: "top", easing: easeOutCubic });
        this.outTransition = new SlideTransition({ duration: 0.25 });

        const charSelectionTextY = characterMenuItemY + selectionItemsYDistance;
        const charSelectionTextX = menuItemX + selectionItemsXDistance;
        const charSelectionTextGap = 55;

        const voiceSelectionTextY = voiceMenuItemY + selectionItemsYDistance;
        const voiceSelectionTextX = menuItemX + selectionItemsXDistance;
        const voiceSelectionTextGap = 55;

        const character = this.game.campaign.selectedCharacter;

        const panel = new ImageNode({
            image: CharacterSelectionScene.panelImage,
            childAnchor: Direction.TOP_LEFT,
            x: this.game.width >> 1,
            y: (this.game.height >> 1) - 16
        }).appendChild(
            new TextNode({
                font: CharacterSelectionScene.headlineFont,
                text: "CHARACTER CUSTOMIZATION",
                anchor: Direction.BOTTOM_LEFT,
                y: -5,
                color: "white"
            })
        ).appendChild(
            this.variant1 = new TextNode({
                font: CharacterSelectionScene.font,
                text: "Variant 1",
                anchor: Direction.TOP_LEFT,
                x: charSelectionTextX,
                y: charSelectionTextY,
                color: "grey"
            })
        ).appendChild(
            this.variant2 = new TextNode({
                font: CharacterSelectionScene.font,
                text: "Variant 2",
                anchor: Direction.TOP_LEFT,
                x: charSelectionTextX + charSelectionTextGap,
                y: charSelectionTextY,
                color: "grey"
            })
        ).appendChild(
            this.voice1 = new TextNode({
                font: CharacterSelectionScene.font,
                text: "High Pitch",
                anchor: Direction.TOP_LEFT,
                x: voiceSelectionTextX,
                y: voiceSelectionTextY,
                color: "grey"
            })
        ).appendChild(
            this.voice2 = new TextNode({
                font: CharacterSelectionScene.font,
                text: "Low Pitch",
                anchor: Direction.TOP_LEFT,
                x: voiceSelectionTextX + voiceSelectionTextGap,
                y: voiceSelectionTextY,
                color: "grey"
            })
        ).appendChild(
            this.character = new AsepriteNode({
                aseprite: CharacterSelectionScene.playerSprites[character],
                tag: "idle",
                anchor: Direction.TOP_LEFT,
                x: 213,
                y: 46
            })
        ).appendChild(
            new ControlTooltipNode({
                control: ControllerAnimationTags.CONFIRM,
                label: "Select or Change",
                anchor: Direction.TOP_LEFT,
                y: CharacterSelectionScene.panelImage.height + 2
            })
        ).appendChild(
            new ControlTooltipNode({
                control: ControllerAnimationTags.BACK,
                label: "Back",
                anchor: Direction.TOP_LEFT,
                y: CharacterSelectionScene.panelImage.height + 18
            })
        ).appendTo(this.rootNode);

        this.menu = new MenuList().setItems(
            new MenuItem(
                MenuItemKey.CHARACTER, "Character:", CharacterSelectionScene.font, "black",
                menuItemX, characterMenuItemY
            ),
            new MenuItem(
                MenuItemKey.VOICE, "Voice:", CharacterSelectionScene.font, "black",
                menuItemX, voiceMenuItemY
            ),
            new MenuItem(
                MenuItemKey.START, "Start Game", CharacterSelectionScene.font, "black",
                menuItemX, startMenuItemY
            )
        ).appendTo(panel);

        this.updateSelection();
    }

    public cleanup(): void {
        this.rootNode.clear();
    }
}
