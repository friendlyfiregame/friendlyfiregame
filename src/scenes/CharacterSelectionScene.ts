import { Aseprite } from '../Aseprite';
import { asset } from '../Assets';
import { BitmapFont } from '../BitmapFont';
import { CharacterAsset, VoiceAsset } from '../Campaign';
import { ControllerAnimationTags, ControllerSpriteMap } from '../input/ControllerFamily';
import { ControllerEvent } from '../input/ControllerEvent';
import { ControllerManager } from '../input/ControllerManager';
import { DIALOG_FONT } from '../constants';
import { Direction } from '../geometry/Direction';
import { easeOutCubic } from '../easings';
import { FriendlyFire } from '../FriendlyFire';
import { GameScene } from './GameScene';
import { MenuItem, MenuList } from '../Menu';
import { Point } from '../geometry/Point';
import { Scene } from '../Scene';
import { Size } from '../geometry/Size';
import { SlideTransition } from '../transitions/SlideTransition';
import { TitleScene } from './TitleScene';

enum MenuItemKey {
    CHARACTER = 'character',
    VOICE = 'voice',
    START = 'start'
}

const menuItemX = 12;
const characterMenuItemPosition = new Point(menuItemX, 20);
const voiceMenuItemPosition = new Point(menuItemX, 50);
const startMenuItemPosition = new Point(menuItemX, 124);
const selectionItemsOffset = new Point(menuItemX, menuItemX);

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
        this.inTransition = new SlideTransition({ duration: 0.5, direction: Direction.UP, easing: easeOutCubic });
        this.outTransition = new SlideTransition({ duration: 0.25 });

        this.menu.setItems(
            new MenuItem(
                MenuItemKey.CHARACTER, "Character:", CharacterSelectionScene.font, "black",
                characterMenuItemPosition
            ),
            new MenuItem(
                MenuItemKey.VOICE, "Voice:", CharacterSelectionScene.font, "black",
                voiceMenuItemPosition
            ),
            new MenuItem(
                MenuItemKey.START, "Start Game", CharacterSelectionScene.font, "black",
                startMenuItemPosition
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

    private drawTooltip(
        ctx: CanvasRenderingContext2D, position: Point, text: string,
        animationTag: ControllerAnimationTags
    ): void {
        const gap = 6;

        const textPosition = position.clone().moveXBy(
            this.controllerSpriteMapRecords[ControllerSpriteMap.KEYBOARD].width + gap
        );

        const controllerSprite = ControllerManager.getInstance().controllerSprite;
        this.controllerSpriteMapRecords[controllerSprite].drawTag(ctx, animationTag, position)
        CharacterSelectionScene.font.drawTextWithOutline(ctx, text, textPosition, "white", "black");
    }

    public draw(ctx: CanvasRenderingContext2D, size: Size): void {
        ctx.save();

        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, size.width, size.height);

        ctx.globalAlpha = 1;

        const x = (size.width / 2) - CharacterSelectionScene.panelImage.width / 2;
        const y = (size.height / 2) - (CharacterSelectionScene.panelImage.height / 2) - 16;
        ctx.translate(x, y);

        ctx.drawImage(CharacterSelectionScene.panelImage, 0, 0);

        CharacterSelectionScene.headlineFont.drawText(
            ctx, "CHARACTER CUSTOMIZATION", new Point(0, -14), "white"
        );

        this.drawTooltip(
            ctx, new Point(0, CharacterSelectionScene.panelImage.height), "Select or Change",
            ControllerAnimationTags.CONFIRM
        );

        this.drawTooltip(
            ctx, new Point(0, CharacterSelectionScene.panelImage.height + 16), "Back",
            ControllerAnimationTags.BACK
        );

        const character = this.game.campaign.selectedCharacter;
        const charSelectionTextPosition = characterMenuItemPosition.clone().moveBy(selectionItemsOffset);
        const charSelectenTextGap = 55;

        if (character === CharacterAsset.MALE) {
            CharacterSelectionScene.font.drawText(
                ctx, "Variant 1", charSelectionTextPosition, "grey"
            );

            CharacterSelectionScene.font.drawTextWithOutline(
                ctx, "Variant 2", charSelectionTextPosition.clone().moveXBy(charSelectenTextGap),
                "white", "black"
            );
        } else {
            CharacterSelectionScene.font.drawTextWithOutline(
                ctx, "Variant 1", charSelectionTextPosition, "white", "black"
            );

            CharacterSelectionScene.font.drawText(
                ctx, "Variant 2", charSelectionTextPosition.clone().moveXBy(charSelectenTextGap),
                "grey"
            );
        }

        CharacterSelectionScene.playerSprites[character].drawTag(ctx, "idle", new Point(213, 46));

        const voice = this.game.campaign.selectedVoice;
        const voiceSelectionTextPosition = voiceMenuItemPosition.clone().moveBy(selectionItemsOffset);
        const voiceSelectenTextGap = 55;

        if (voice === VoiceAsset.MALE) {
            CharacterSelectionScene.font.drawText(
                ctx, "High Pitch", voiceSelectionTextPosition, "grey"
            );

            CharacterSelectionScene.font.drawTextWithOutline(
                ctx, "Low Pitch", voiceSelectionTextPosition.clone().moveXBy(voiceSelectenTextGap),
                "white", "black"
            );
        } else {
            CharacterSelectionScene.font.drawTextWithOutline(
                ctx, "High Pitch", voiceSelectionTextPosition, "white", "black"
            );

            CharacterSelectionScene.font.drawText(
                ctx, "Low Pitch", voiceSelectionTextPosition.clone().moveXBy(voiceSelectenTextGap),
                "grey"
            );
        }

        ctx.font = "20px sans-serif";
        ctx.fillStyle = "white";
        this.menu.draw(ctx);
        ctx.restore();
    }
}
