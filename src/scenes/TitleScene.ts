import { Aseprite } from '../Aseprite';
import { asset } from '../Assets';
import { BitmapFont } from '../BitmapFont';
import { ControllerEvent } from '../input/ControllerEvent';
import { ControlsScene } from './ControlsScene';
import { CreditsScene } from './CreditsScene';
import { CurtainTransition } from '../transitions/CurtainTransition';
import { DIALOG_FONT } from '../constants';
import { easeInSine } from '../easings';
import { FadeTransition } from '../transitions/FadeTransition';
import { FriendlyFire } from '../FriendlyFire';
import { GameScene } from './GameScene';
import { isElectron } from '../util';
import { MenuAlignment, MenuItem, MenuList } from '../Menu';
import { Point } from '../Geometry';
import { Scene } from '../Scene';
import { Sound } from '../Sound';

type MainMenuParams = {
    label: string;
    electronOnly?: boolean;
}

enum MenuItemKey {
    START = 'start',
    CONTROLS = 'controls',
    CREDITS = 'credits',
    EXIT = 'exit'
}

const MenuLabels: Record<MenuItemKey, MainMenuParams> = {
    [MenuItemKey.START]: { label: "Start Game" },
    [MenuItemKey.CONTROLS]: { label: "Controls and Options" },
    [MenuItemKey.CREDITS]: { label: "Credits" },
    [MenuItemKey.EXIT]: { label: "Exit Game", electronOnly: true },
};

export class TitleScene extends Scene<FriendlyFire> {
    @asset("music/cerulean-expanse.ogg")
    private static music: Sound;

    @asset("images/title/layer1.aseprite.json")
    private static titleLayer1: Aseprite;

    @asset("images/title/layer2.aseprite.json")
    private static titleLayer2: Aseprite;

    @asset("images/title/island1.aseprite.json")
    private static titleIsland1: Aseprite;

    @asset("images/title/island2.aseprite.json")
    private static titleIsland2: Aseprite;

    @asset("images/title/layer3.aseprite.json")
    private static titleLayer3: Aseprite;

    @asset("images/title/person.aseprite.json")
    private static person: Aseprite;

    @asset("images/logo.png")
    private static logoImage: HTMLImageElement;

    @asset("sprites/flameicon.aseprite.json")
    private static flameicon: Aseprite;

    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    private menu = new MenuList(MenuAlignment.CENTER);
    private time = 0;
    private animationProgress = 0;
    private logoAlphaProgress = 0;
    private animationDuration = 3;

    private titleBasePosition = new Point(this.game.width / 2 - TitleScene.logoImage.width / 2, 60);
    private titleLayer1Position = new Point(0, 70)
    private titleLayer2Position = new Point(0, 163)
    private titleLayer3Position = new Point(0, -125)

    private menuBasePosition = new Point(this.game.width / 2, 190);
    private menuGap = 15;

    public setup(): void {
        this.zIndex = 1;
        this.time = 0;
        this.animationProgress = 0;
        this.logoAlphaProgress = 0;
        this.inTransition = new FadeTransition();
        this.outTransition = new CurtainTransition({ easing: easeInSine });
        this.menu.reset();

        Object.values(MenuItemKey).forEach((key, index) => {
            if (!MenuLabels[key].electronOnly || (isElectron() || window.opener)) {
                this.menu.addItems(
                    new MenuItem(
                        key,
                        MenuLabels[key].label,
                        TitleScene.font,
                        'white',
                        this.menuBasePosition.clone().moveYBy(this.menuGap * index)
                    )
                );
            }
        });
    }

    public animationIsDone(): boolean {
        return this.animationProgress === 1;
    }

    public finishAnimation(): void {
        this.animationProgress = 1;
        this.logoAlphaProgress = 1;
    }

    public handleMenuAction (buttonId: string) {
        switch(buttonId) {
            case MenuItemKey.START:
                this.stopMusicTrack();
                this.game.scenes.setScene(GameScene);
                break;
            case MenuItemKey.CONTROLS:
                this.game.scenes.pushScene(ControlsScene);
                break;
            case MenuItemKey.CREDITS:
                this.stopMusicTrack();
                this.game.scenes.pushScene(CreditsScene);
                break;
            case MenuItemKey.EXIT:
                window.close();
                break;
        }
    }

    public activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
        this.menu.onActivated.connect(this.handleMenuAction, this)
        this.playMusicTrack();
    }

    public deactivate(): void {
        this.input.onButtonDown.disconnect(this.handleButtonDown, this);
        this.menu.onActivated.disconnect(this.handleMenuAction, this);
    }

    private handleButtonDown(event: ControllerEvent): void {
        if (this.animationIsDone()) {
            if (event.isConfirm) {
                this.menu.executeAction();
            } else if (event.isMenuUp) {
                this.menu.prev();
            } else if (event.isMenuDown) {
                this.menu.next();
            }
        } else {
            if (event.isConfirm) {
                this.finishAnimation();
            }
        }

    }

    public update(dt: number) {
        this.time += dt;

        if (this.time < this.animationDuration && !this.animationIsDone()) {
            this.animationProgress = -Math.pow((1/this.animationDuration * this.time - 1), 2) + 1;
            this.logoAlphaProgress = -Math.pow((1/(this.animationDuration / 2) * this.time - 2), 2) + 1;
        } else {
            this.finishAnimation();
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();

        const layer3OffY = (1 - this.animationProgress) * 100;
        TitleScene.titleLayer3.drawTag(ctx, "idle", new Point(this.titleLayer3Position.x, this.titleLayer3Position.y + layer3OffY), this.time * 1000);

        const layer2OffY = (1 - this.animationProgress) * 200;
        TitleScene.titleLayer2.drawTag(ctx, "idle", new Point(this.titleLayer2Position.x, this.titleLayer2Position.y + layer2OffY), this.time * 1000);

        const islandOffY = (1 - this.animationProgress) * 250;
        TitleScene.titleIsland1.drawTag(ctx, "idle", new Point(90, 168 + islandOffY), this.time * 1000);
        TitleScene.titleIsland2.drawTag(ctx, "idle", new Point(323, 178 + islandOffY), this.time * 1000);

        const personOff = (1 - this.animationProgress) * 330;
        TitleScene.person.drawTag(ctx, "idle", new Point(22, 155 + personOff), this.time * 1000);

        const layer1OffY = (1 - this.animationProgress) * 300;
        TitleScene.titleLayer1.drawTag(ctx, "idle", new Point(this.titleLayer1Position.x, this.titleLayer1Position.y + layer1OffY), this.time * 1000);

        ctx.globalAlpha = Math.max(this.logoAlphaProgress, 0);
        const menuOffY = (1 - this.animationProgress) * 150;
        ctx.drawImage(TitleScene.logoImage, this.titleBasePosition.x, this.titleBasePosition.y + menuOffY);
        TitleScene.flameicon.drawTag(ctx, "idle", this.titleBasePosition.clone().moveBy(147, - 10 + menuOffY), this.time * 1000);

        ctx.restore();
        if (this.animationIsDone()) {
            this.menu.draw(ctx);
        }
    }

    private stopMusicTrack(): void {
        TitleScene.music.stop();
    }

    private playMusicTrack(): void {
        TitleScene.music.setLoop(true);
        TitleScene.music.setVolume(0.30);
        TitleScene.music.play();
    }
}
