import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { asset } from "../Assets";
import { FadeTransition } from "../transitions/FadeTransition";
import { CurtainTransition } from "../transitions/CurtainTransition";
import { easeInSine } from "../easings";
import { BitmapFont } from "../BitmapFont";
import { GameScene } from "./GameScene";
import { ControlsScene } from "./ControlsScene";
import { MenuList, MenuItem, MenuAlignment } from '../Menu';
import { isElectron } from "../util";
import { ControllerEvent } from "../input/ControllerEvent";
import { CreditsScene } from './CreditsScene';
import { Aseprite } from '../Aseprite';
import { Sound } from '../Sound';
import { DIALOG_FONT } from "../constants";

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
    [MenuItemKey.CONTROLS]: { label: "Controls" },
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

    private titleBasePosition = {
        x: this.game.width / 2 - TitleScene.logoImage.width / 2,
        y: 60
    }
    private titleLayer1Position = { x: 0, y: 70 }
    private titleLayer2Position = { x: 0, y: 163 }
    private titleLayer3Position = { x: 0, y: -125 }

    private menuBasePosition = {
        x: this.game.width / 2,
        y: 190,
        gap: 15,
    }


    public setup(): void {
        this.zIndex = 1;
        this.time = 0;
        this.animationProgress = 0;
        this.logoAlphaProgress = 0;
        this.inTransition = new FadeTransition();
        this.outTransition = new CurtainTransition({ easing: easeInSine });

        Object.values(MenuItemKey).forEach((key, index) => {
            if (!MenuLabels[key].electronOnly || (isElectron() || window.opener)) {
                this.menu.addItems(
                    new MenuItem(key, MenuLabels[key].label, TitleScene.font, "white", this.menuBasePosition.x, this.menuBasePosition.y + this.menuBasePosition.gap * index)
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

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();
        ctx.beginPath();

        const layer3OffY = (1 - this.animationProgress) * 100;
        TitleScene.titleLayer3.drawTag(ctx, "idle", this.titleLayer3Position.x, this.titleLayer3Position.y + layer3OffY, this.time * 1000);

        const layer2OffY = (1 - this.animationProgress) * 200;
        TitleScene.titleLayer2.drawTag(ctx, "idle", this.titleLayer2Position.x, this.titleLayer2Position.y + layer2OffY, this.time * 1000);

        const islandOffY = (1 - this.animationProgress) * 250;
        TitleScene.titleIsland1.drawTag(ctx, "idle", 90, 168 + islandOffY, this.time * 1000);
        TitleScene.titleIsland2.drawTag(ctx, "idle", 323, 178 + islandOffY, this.time * 1000);

        const personOff = (1 - this.animationProgress) * 330;
        TitleScene.person.drawTag(ctx, "idle", 22, 155 + personOff, this.time * 1000);

        const layer1OffY = (1 - this.animationProgress) * 300;
        TitleScene.titleLayer1.drawTag(ctx, "idle", this.titleLayer1Position.x, this.titleLayer1Position.y + layer1OffY, this.time * 1000);

        ctx.globalAlpha = Math.max(this.logoAlphaProgress, 0);
        const menuOffY = (1 - this.animationProgress) * 150;
        ctx.drawImage(TitleScene.logoImage, this.titleBasePosition.x, this.titleBasePosition.y + menuOffY);
        TitleScene.flameicon.drawTag(ctx, "idle", this.titleBasePosition.x + 147, this.titleBasePosition.y - 10 + menuOffY, this.time * 1000);

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
