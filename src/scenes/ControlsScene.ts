import { Aseprite } from '../Aseprite';
import { asset } from '../Assets';
import { BitmapFont } from '../BitmapFont';
import { ControllerAnimationTags, ControllerSpriteMap } from '../input/ControllerFamily';
import { ControllerEvent } from '../input/ControllerEvent';
import { ControllerManager } from '../input/ControllerManager';
import { DIALOG_FONT } from '../constants';
import { Direction } from '../geometry/Direction';
import { easeOutCubic } from '../easings';
import { FriendlyFire } from '../FriendlyFire';
import { Point } from '../geometry/Point';
import { Scene } from '../Scene';
import { Size } from '../geometry/Size';
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
        this.inTransition = new SlideTransition({ duration: 0.5, direction: Direction.UP, easing: easeOutCubic });
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

    // TODO: Should be unified with `drawTooltip(…)` in CharacterSelectionScene
    private drawTooltip(
        ctx: CanvasRenderingContext2D, position: Point, text: string,
        animationTag: ControllerAnimationTags
    ): void {
        const GAP = 6;
        const controllerSprite = ControllerManager.getInstance().controllerSprite;

        this.controllerSpriteMapRecords[controllerSprite].drawTag(
            ctx,
            animationTag,
            position.clone()
        );

        ControlsScene.font.drawTextWithOutline(
            ctx,
            text,
            position.clone().moveXBy(
                this.controllerSpriteMapRecords[ControllerSpriteMap.KEYBOARD].width + GAP
            ),
            'white',
            'black'
        );
    }

    public draw(ctx: CanvasRenderingContext2D, size: Size): void {
        ctx.save();

        ctx.globalAlpha = 0.8;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, size.width, size.height);

        ctx.globalAlpha = 1;

        const position = new Point(
            size.width / 2 - ControlsScene.panelImage.width / 2,
            size.height / 2 - ControlsScene.panelImage.height / 2 - 16
        );

        const TEXT_OFFSET_X = 10;
        const STARTING_Y = 35;
        const GAP = 20;

        ctx.translate(position.x, position.y);
        ctx.drawImage(ControlsScene.panelImage, 0, 0);

        const controllerSprite = ControllerManager.getInstance().selectedGamepadStyle;

        ControlsScene.gamepadSelection.drawTag(ctx, controllerSprite, new Point(204, 2));
        ControlsScene.gamepadControls.drawTag(ctx, controllerSprite, new Point(206, 35));

        this.drawTooltip(
            ctx,
            new Point(0, ControlsScene.panelImage.height),
            'Toggle Gamepad Button Prompts',
            ControllerAnimationTags.ACTION
        );

        this.drawTooltip(
            ctx,
            new Point(0, ControlsScene.panelImage.height + 16),
            'Back',
            ControllerAnimationTags.BACK
        );

        ctx.font = '20px sans-serif';
        ctx.fillStyle = 'white';

        const fontColor = 'black';
        let drawingPosition = new Point(TEXT_OFFSET_X, STARTING_Y);

        this.controls.forEach(label => {
            ControlsScene.font.drawText(ctx, label, drawingPosition.clone(), fontColor);

            drawingPosition.moveYBy(GAP);
        });

        ctx.drawImage(ControlsScene.keyboardKeys, 123, STARTING_Y - 2);
        ctx.restore();
    }
}
