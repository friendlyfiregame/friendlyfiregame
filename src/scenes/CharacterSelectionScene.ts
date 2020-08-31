import { Aseprite } from '../Aseprite';
import { asset } from '../Assets';
import { BitmapFont } from '../BitmapFont';
import { CharacterAsset, VoiceAsset } from '../Campaign';
import { ControllerAnimationTags, ControllerSpriteMap } from '../input/ControllerFamily';
import { ControllerEvent } from '../input/ControllerEvent';
import { ControllerManager } from '../input/ControllerManager';
import { DIALOG_FONT } from '../constants';
import { easeOutCubic } from '../easings';
import { FriendlyFire } from '../FriendlyFire';
import { GameScene } from './GameScene';
import { MenuItem, MenuList } from '../Menu';
import { Scene } from '../Scene';
import { SlideTransition } from '../transitions/SlideTransition';
import { TitleScene } from './TitleScene';

enum MenuItemKey {
    CHARACTER = 'character',
    VOICE = 'voice',
    START = 'start'
}

const menuItemX = 12;
const characterMenuItemY = 20;
const voiceMenuItemY = 50;
const startMenuItemY = 124;
const selectionItemsYDistance = 12;
const selectionItemsXDistance = 12

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

    @asset([
        "sprites/buttons_keyboard.aseprite.json",
        "sprites/buttons_xbox.aseprite.json",
        "sprites/buttons_playstation.aseprite.json"
    ])
    public static buttons: Aseprite[];

    public controllerSpriteMapRecords: Record<ControllerSpriteMap, Aseprite> = {
        [ControllerSpriteMap.KEYBOARD]: CharacterSelectionScene.buttons[0],
        [ControllerSpriteMap.XBOX]: CharacterSelectionScene.buttons[1],
        [ControllerSpriteMap.PLAYSTATION]: CharacterSelectionScene.buttons[2]
    };

    private menu = new MenuList();

    public setup(): void {
        this.zIndex = 2;
        this.inTransition = new SlideTransition({ duration: 0.5, direction: "top", easing: easeOutCubic });
        this.outTransition = new SlideTransition({ duration: 0.25 });

        this.menu.setItems(
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
        )
    }

    public activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
        this.menu.onActivated.connect(this.handleMenuAction, this)
    }

    public deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
        this.menu.onActivated.disconnect(this.handleMenuAction, this);
    }

    public async handleMenuAction(buttonId: string): Promise<void> {
        switch(buttonId) {
            case MenuItemKey.CHARACTER:
                this.game.campaign.toggleCharacterAsset();
                break;
            case MenuItemKey.VOICE:
                this.game.campaign.toggleVoiceAsset();
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

    // TODO: Should be unified with `drawTooltip(…)` in ControlScene
    private drawTooltip(
        ctx: CanvasRenderingContext2D, x: number, y: number, text: string,
        animationTag: ControllerAnimationTags
    ): void {
        const gap = 6;

        const textPositionX = Math.round(
            x + this.controllerSpriteMapRecords[ControllerSpriteMap.KEYBOARD].width + gap
        );

        const textPositionY = y;
        const controllerSprite = ControllerManager.getInstance().controllerSprite;
        this.controllerSpriteMapRecords[controllerSprite].drawTag(ctx, animationTag, x, y)

        CharacterSelectionScene.font.drawTextWithOutline(
            ctx,
            text,
            textPositionX, textPositionY,
            "white",
            "black"
        );
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.save();

        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);

        ctx.globalAlpha = 1;

        const x = (width / 2) - CharacterSelectionScene.panelImage.width / 2;
        const y = (height / 2) - (CharacterSelectionScene.panelImage.height / 2) - 16;
        ctx.translate(x, y);

        ctx.drawImage(CharacterSelectionScene.panelImage, 0, 0);

        CharacterSelectionScene.headlineFont.drawText(
            ctx, "CHARACTER CUSTOMIZATION", 0, -14, "white"
        );

        this.drawTooltip(
            ctx, 0, CharacterSelectionScene.panelImage.height, "Select or Change",
            ControllerAnimationTags.CONFIRM
        );

        this.drawTooltip(
            ctx, 0, CharacterSelectionScene.panelImage.height + 16, "Back",
            ControllerAnimationTags.BACK
        );

        const character = this.game.campaign.selectedCharacter;
        const charSelectionTextY = characterMenuItemY + selectionItemsYDistance;
        const charSelectionTextX = menuItemX + selectionItemsXDistance;
        const charSelectenTextGap = 55;

        if (character === CharacterAsset.MALE) {
            CharacterSelectionScene.font.drawText(
                ctx, "Variant 1", charSelectionTextX, charSelectionTextY, "grey"
            );

            CharacterSelectionScene.font.drawTextWithOutline(
                ctx, "Variant 2", charSelectionTextX + charSelectenTextGap, charSelectionTextY,
                "white", "black"
            );
        } else {
            CharacterSelectionScene.font.drawTextWithOutline(
                ctx, "Variant 1", charSelectionTextX, charSelectionTextY,
                "white", "black"
            );

            CharacterSelectionScene.font.drawText(
                ctx, "Variant 2", charSelectionTextX + charSelectenTextGap, charSelectionTextY,
                "grey"
            );
        }

        CharacterSelectionScene.playerSprites[character].drawTag(ctx, "idle", 213, 46);

        const voice = this.game.campaign.selectedVoice;
        const voiceSelectionTextY = voiceMenuItemY + selectionItemsYDistance;
        const voiceSelectionTextX = menuItemX + selectionItemsXDistance;
        const voiceSelectenTextGap = 55;

        if (voice === VoiceAsset.MALE) {
            CharacterSelectionScene.font.drawText(
                ctx, "High Pitch", voiceSelectionTextX, voiceSelectionTextY, "grey"
            );

            CharacterSelectionScene.font.drawTextWithOutline(
                ctx, "Low Pitch", voiceSelectionTextX + voiceSelectenTextGap, voiceSelectionTextY,
                "white", "black"
            );
        } else {
            CharacterSelectionScene.font.drawTextWithOutline(
                ctx, "High Pitch", voiceSelectionTextX, voiceSelectionTextY, "white", "black"
            );

            CharacterSelectionScene.font.drawText(
                ctx, "Low Pitch", voiceSelectionTextX + voiceSelectenTextGap, voiceSelectionTextY,
                "grey"
            );
        }

        ctx.font = "20px sans-serif";
        ctx.fillStyle = "white";
        this.menu.draw(ctx);
        ctx.restore();
    }
}
