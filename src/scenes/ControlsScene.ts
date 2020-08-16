import { Aseprite } from '../Aseprite';
import { asset } from '../Assets';
import { BitmapFont } from '../BitmapFont';
import { ControllerAnimationTags, ControllerSpriteMap } from '../input/ControllerFamily';
import { ControllerEvent } from '../input/ControllerEvent';
import { ControllerManager } from '../input/ControllerManager';
import { DIALOG_FONT } from '../constants';
import { easeOutCubic } from '../easings';
import { FriendlyFire } from '../FriendlyFire';
import { Scene } from '../Scene';
import { SlideTransition } from '../transitions/SlideTransition';

export class ControlsScene extends Scene<FriendlyFire> {
    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    @asset("images/controls.png")
    private static panelImage: HTMLImageElement;

    @asset("images/controls_keyboard.png")
    private static keyboardKeys: HTMLImageElement;

    @asset("images/gamepad_selection.aseprite.json")
    private static gamepadSelection: Aseprite;

    @asset("images/controls_gamepad.aseprite.json")
    private static gamepadControls: Aseprite;

    @asset([
        "sprites/buttons_keyboard.aseprite.json",
        "sprites/buttons_xbox.aseprite.json",
        "sprites/buttons_playstation.aseprite.json"
    ])
    public static buttons: Aseprite[];
    public controllerSpriteMapRecords: Record<ControllerSpriteMap, Aseprite> = {
        [ControllerSpriteMap.KEYBOARD]: ControlsScene.buttons[0],
        [ControllerSpriteMap.XBOX]: ControlsScene.buttons[1],
        [ControllerSpriteMap.PLAYSTATION]: ControlsScene.buttons[2]
    };

    private controls: string[] = [
        "Walk",
        "Jump",
        "Run",
        "Interact",
        "Throw",
        "Enter doors",
        "Pause"
    ];

    public setup(): void {
        this.zIndex = 2;
        this.inTransition = new SlideTransition({ duration: 0.5, direction: "top", easing: easeOutCubic });
        this.outTransition = new SlideTransition({ duration: 0.25 });
    }

    public activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
    }

    public deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
    }

    private handleButtonDown(event: ControllerEvent): void {
        if (event.isAbort || event.isPause) {
            this.scenes.popScene();
        }
        if (event.isPlayerAction) {
            ControllerManager.getInstance().toggleSelectedGamepadStyle();
        }
    }

    private drawTooltip (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, animationTag: ControllerAnimationTags) {
        const gap = 6;
        const textPositionX = Math.round(x + this.controllerSpriteMapRecords[ControllerSpriteMap.KEYBOARD].width + gap);
        const textPositionY = y;
        const controllerSprite = ControllerManager.getInstance().controllerSprite;
        this.controllerSpriteMapRecords[controllerSprite].drawTag(ctx, animationTag, x, y)
        ControlsScene.font.drawTextWithOutline(ctx, text, textPositionX, textPositionY, "white", "black");
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();

        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);

        ctx.globalAlpha = 1;

        const x = (width / 2) - ControlsScene.panelImage.width / 2;
        const y = (height / 2) - (ControlsScene.panelImage.height / 2) - 16;
        const textOffsetX = 10;
        const startingY = 35;
        const gap = 20;
        ctx.translate(x, y);
        
        ctx.drawImage(ControlsScene.panelImage, 0, 0);

        const controllerSprite = ControllerManager.getInstance().selectedGamepadStyle;
        ControlsScene.gamepadSelection.drawTag(ctx, controllerSprite, 204, 2);
        ControlsScene.gamepadControls.drawTag(ctx, controllerSprite, 206, 35);
        this.drawTooltip(ctx, 0, ControlsScene.panelImage.height, "Toggle Gamepad Button Prompts", ControllerAnimationTags.ACTION);
        this.drawTooltip(ctx, 0, ControlsScene.panelImage.height + 16, "Back", ControllerAnimationTags.BACK);


        ctx.font = "20px sans-serif";
        ctx.fillStyle = "white";

        // ctx.translate((width / 2) - ControlsScene.panelImage.width, (height / 2) - ControlsScene.panelImage.height);
        const fontColor = "black";

        let textOffsetY = startingY;
        this.controls.forEach(label => {
            ControlsScene.font.drawText(ctx, label, textOffsetX, textOffsetY, fontColor);
            textOffsetY += gap;
        })

        ctx.drawImage(ControlsScene.keyboardKeys, 123, startingY - 2);
        ctx.restore();
    }
}
