import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { BitmapFont } from "../BitmapFont";
import { ControllerEvent } from "../input/ControllerEvent";
import { ControlsScene } from "./ControlsScene";
import { CreditsScene } from "./CreditsScene";
import { CurtainTransition } from "../transitions/CurtainTransition";
import { DIALOG_FONT } from "../../shared/constants";
import { easeInSine, easeOutQuad } from "../easings";
import { FadeTransition } from "../transitions/FadeTransition";
import { FriendlyFire } from "../FriendlyFire";
import { isElectron } from "../util";
import { MenuAlignment, MenuItem, MenuList } from "../Menu";
import { Scene } from "../Scene";
import { Sound } from "../audio/Sound";
import { CharacterSelectionScene } from "./CharacterSelectionScene";
import { AsepriteNode } from "../scene/AsepriteNode";
import { Direction } from "../geom/Direction";
import { ImageNode } from "../scene/ImageNode";
import { SceneNode } from "../scene/SceneNode";
import { GlobalState } from "../GlobalState";
import { QuestKey } from "../Quests";
import { OptionsScene } from "./OptionsScene";

type MainMenuParams = {
    label: string;
    electronOnly?: boolean;
};

enum MenuItemKey {
    START = "start",
    CONTROLS = "controls",
    OPTIONS = "options",
    CREDITS = "credits",
    EXIT = "exit"
}

const MenuLabels: Record<MenuItemKey, MainMenuParams> = {
    [MenuItemKey.START]: { label: "Start Game" },
    [MenuItemKey.CONTROLS]: { label: "Controls" },
    [MenuItemKey.OPTIONS]: { label: "Options" },
    [MenuItemKey.CREDITS]: { label: "Credits" },
    [MenuItemKey.EXIT]: { label: "Exit Game", electronOnly: true },
};

export class TitleScene extends Scene<FriendlyFire> {
    @asset("music/cerulean-expanse.ogg")
    public static music: Sound;

    @asset("images/title/layer1.aseprite.json")
    private static readonly titleLayer1: Aseprite;

    @asset("images/title/layer2.aseprite.json")
    private static readonly titleLayer2: Aseprite;

    @asset("images/title/island1.aseprite.json")
    private static readonly titleIsland1: Aseprite;

    @asset("images/title/island2.aseprite.json")
    private static readonly titleIsland2: Aseprite;

    @asset("images/title/layer3.aseprite.json")
    private static readonly titleLayer3: Aseprite;

    @asset("images/title/person.aseprite.json")
    private static readonly person: Aseprite;

    @asset("images/logo.png")
    private static readonly logoImage: HTMLImageElement;

    @asset("sprites/flameicon.aseprite.json")
    private static readonly flameicon: Aseprite;

    @asset("sprites/ending_cards.aseprite.json")
    private static readonly endingCards: Aseprite;

    @asset(DIALOG_FONT)
    private static readonly font: BitmapFont;

    private menu!: MenuList;

    private readonly animationDuration = 3;

    private readonly titleBasePosition = {
        x: this.game.width / 2 - TitleScene.logoImage.width / 2,
        y: 60
    };

    private readonly titleLayer1Position = { x: 0, y: 70 };
    private readonly titleLayer2Position = { x: 0, y: 163 };
    private readonly titleLayer3Position = { x: 0, y: -125 };

    private readonly menuBasePosition = {
        x: this.game.width / 2,
        y: 180,
        gap: 15,
    };

    public override get urlFragment(): string {
        return "#title";
    }

    public override cleanup(): void {
        this.rootNode.clear();
    }

    public override setup(): void {
        this.zIndex = 1;
        this.inTransition = new FadeTransition();
        this.outTransition = new CurtainTransition({ easing: easeInSine });

        // The sky background layer
        new AsepriteNode({
            id: "titleLayer3",
            aseprite: TitleScene.titleLayer3,
            tag: "idle",
            x: this.titleLayer3Position.x,
            y: this.titleLayer3Position.y,
            anchor: Direction.TOP_LEFT
        }).animate({
            animator: (node, value) => node.setY(this.titleLayer3Position.y + (1 - value) * 100),
            duration: this.animationDuration,
            easing: easeOutQuad
        }).appendTo(this.rootNode);

        // The background layer with the sea animated to move in from the bottom
        new AsepriteNode({
            id: "titleLayer2",
            aseprite: TitleScene.titleLayer2,
            tag: "idle",
            x: this.titleLayer2Position.x,
            y: this.titleLayer2Position.y,
            anchor: Direction.TOP_LEFT
        }).animate({
            animator: (node, value) => node.setY(this.titleLayer2Position.y + (1 - value) * 200),
            duration: this.animationDuration,
            easing: easeOutQuad
        }).appendTo(this.rootNode);

        // The two floating islands in the background animated to moving in from the bottom
        new SceneNode().appendChild(
            new AsepriteNode({
                id: "titleIsland1",
                aseprite: TitleScene.titleIsland1,
                tag: "idle",
                anchor: Direction.TOP_LEFT,
                x: 90,
                y: 168
            })
        ).appendChild(
            new AsepriteNode({
                id: "titleIsland2",
                aseprite: TitleScene.titleIsland2,
                tag: "idle",
                anchor: Direction.TOP_LEFT,
                x: 323,
                y: 178
            })
        ).animate({
            animator: (node, value) => node.setY((1 - value) * 250),
            duration: this.animationDuration,
            easing: easeOutQuad
        }).appendTo(this.rootNode);

        // The girl standing on the ground animated to move in from the bottom
        new AsepriteNode({
            id: "person",
            aseprite: TitleScene.person,
            tag: "idle",
            x: 22,
            y: 155,
            anchor: Direction.TOP_LEFT
        }).animate({
            animator: (node, value) => node.setY(155 + (1 - value) * 330),
            duration: this.animationDuration,
            easing: easeOutQuad
        }).appendTo(this.rootNode);

        // The ground layer animated to move in from the bottom
        new AsepriteNode({
            id: "titleLayer1",
            aseprite: TitleScene.titleLayer1,
            tag: "idle",
            x: this.titleLayer1Position.x,
            y: this.titleLayer1Position.y,
            anchor: Direction.TOP_LEFT
        }).animate({
            animator: (node, value) => node.setY(this.titleLayer1Position.y + (1 - value) * 300),
            duration: this.animationDuration,
            easing: easeOutQuad
        }).appendTo(this.rootNode);

        // The title text with flame icon fading in and moving to the top
        new SceneNode({
            opacity: 0,
            x: this.titleBasePosition.x,
            y: this.titleBasePosition.y
        }).appendChild(
            new AsepriteNode({
                id: "flameicon",
                aseprite: TitleScene.flameicon,
                tag: "idle",
                anchor: Direction.TOP_LEFT,
                x: 147,
                y: -10
            })
        ).appendChild(
            new ImageNode({
                id: "logoImage",
                image: TitleScene.logoImage,
                anchor: Direction.TOP_LEFT
            })
        ).animate({
            animator: (node, value) => node.setY(this.titleBasePosition.y - 10 + 150 * (1 - value)),
            duration: this.animationDuration,
            easing: easeOutQuad
        }).animate({
            animator: (node, value) => node.setOpacity(value),
            delay: this.animationDuration / 2,
            duration: this.animationDuration / 2,
            easing: easeOutQuad
        }).appendTo(this.rootNode);

        this.menu = new MenuList({
            id: "menu",
            opacity: 0,
            align: MenuAlignment.CENTER
        }).animate({
            animator: (node, value) => node.setOpacity(value),
            delay: 2.5,
            duration: 0.5,
            easing: easeOutQuad
        }).appendTo(this.rootNode);

        if (GlobalState.getHasBeatenGame()) {
            new SceneNode({
                opacity: 0,
                x: 118,
                y: 108,
            })
            .appendChild(this.addEndingCard(0, QuestKey.A))
            .appendChild(this.addEndingCard(1, QuestKey.B))
            .appendChild(this.addEndingCard(2, QuestKey.C))
            .appendChild(this.addEndingCard(3, QuestKey.D))
            .appendChild(this.addEndingCard(4, QuestKey.E))
            .animate({
                animator: (node, value) => node.setOpacity(value),
                delay: 2.5,
                duration: 0.5,
                easing: easeOutQuad
            }).appendTo(this.rootNode);
        }

        Object.values(MenuItemKey).forEach((key, index) => {
            if (!MenuLabels[key].electronOnly || (isElectron() || window.opener)) {
                this.menu.addItems(
                    new MenuItem(
                        key,
                        MenuLabels[key].label,
                        TitleScene.font,
                        "white",
                        this.menuBasePosition.x, this.menuBasePosition.y + this.menuBasePosition.gap * index
                    )
                );
            }
        });
    }

    public animationIsDone(): boolean {
        return !this.rootNode.hasAnimations();
    }

    public finishAnimation(): void {
        this.rootNode.finishAnimations();
    }

    public addEndingCard(index: number, key: QuestKey): AsepriteNode {
        let tag = "";
        switch (key) {
            case QuestKey.A: tag = "a_"; break;
            case QuestKey.B: tag = "b_"; break;
            case QuestKey.C: tag = "c_"; break;
            case QuestKey.D: tag = "d_"; break;
            case QuestKey.E: tag = "e_"; break;
        }

        const isAchieved = GlobalState.getAchievedEndings().includes(key);
        tag += isAchieved ? "on" : "off";

        return new AsepriteNode({
            id: `endingCard_${key}`,
            aseprite: TitleScene.endingCards,
            tag,
            anchor: Direction.TOP_LEFT,
            x: index * 40 + (index * 10),
            y: 0
        });
    }

    public async handleMenuAction(buttonId: string): Promise<void> {
        switch (buttonId) {
            case MenuItemKey.START:
                // this.stopMusicTrack();
                await this.game.scenes.pushScene(CharacterSelectionScene);
                // this.game.scenes.setScene(GameScene);
                break;
            case MenuItemKey.CONTROLS:
                await this.game.scenes.pushScene(ControlsScene);
                break;
            case MenuItemKey.OPTIONS:
                await this.game.scenes.pushScene(OptionsScene);
                break;
            case MenuItemKey.CREDITS:
                this.stopMusicTrack();
                await this.game.scenes.pushScene(CreditsScene);
                break;
            case MenuItemKey.EXIT:
                window.close();
                break;
        }
    }

    public override activate(): void {
        this.input.onButtonDown.connect(this.handleButtonDown, this);
        this.menu.onActivated.connect(this.handleMenuAction, this);
        this.playMusicTrack();
    }

    public override deactivate(): void {
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

    private stopMusicTrack(): void {
        TitleScene.music.stop();
    }

    private playMusicTrack(): void {
        TitleScene.music.setLoop(true);
        TitleScene.music.setVolume(0.30);
        TitleScene.music.play();
    }
}
