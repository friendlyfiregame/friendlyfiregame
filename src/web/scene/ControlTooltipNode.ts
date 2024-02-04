import { DIALOG_FONT } from "../../shared/constants";
import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { type BitmapFont } from "../BitmapFont";
import { type FriendlyFire } from "../FriendlyFire";
import { Direction } from "../geom/Direction";
import { type ControllerAnimationTags, ControllerSpriteMap } from "../input/ControllerFamily";
import { ControllerManager } from "../input/ControllerManager";
import { AsepriteNode } from "./AsepriteNode";
import { SceneNode, type SceneNodeArgs } from "./SceneNode";
import { TextNode } from "./TextNode";

export interface ControlTooltipArgs extends SceneNodeArgs {
    control: ControllerAnimationTags,
    label: string
}

export class ControlTooltipNode extends SceneNode<FriendlyFire> {
    @asset(DIALOG_FONT)
    private static readonly font: BitmapFont;

    @asset([
        "sprites/buttons_keyboard.aseprite.json",
        "sprites/buttons_xbox.aseprite.json",
        "sprites/buttons_playstation.aseprite.json",
        "sprites/buttons_stadia.aseprite.json"
    ])
    private static readonly buttons: Aseprite[];
    private readonly controllerSpriteMapRecords: Record<ControllerSpriteMap, Aseprite> = {
        [ControllerSpriteMap.KEYBOARD]: ControlTooltipNode.buttons[0],
        [ControllerSpriteMap.XBOX]: ControlTooltipNode.buttons[1],
        [ControllerSpriteMap.PLAYSTATION]: ControlTooltipNode.buttons[2],
        [ControllerSpriteMap.STADIA]: ControlTooltipNode.buttons[3]
    };

    private readonly controllerManager = ControllerManager.getInstance();
    private readonly icon: AsepriteNode;
    private readonly label: TextNode;
    private readonly gap = 6;

    public constructor({ control: key, label, ...args }: ControlTooltipArgs) {
        super({
            childAnchor: Direction.LEFT,
            ...args
        });
        this.icon = new AsepriteNode({
            aseprite: this.controllerSpriteMapRecords[this.controllerManager.controllerSprite],
            tag: key,
            anchor: Direction.LEFT
        }).appendTo(this);
        this.label = new TextNode({
            font: ControlTooltipNode.font,
            anchor: Direction.LEFT,
            text: label,
            color: "white",
            outlineColor: "black",
            y: -1
        }).appendTo(this);
        this.updateLayout();
    }

    /** @inheritDoc */
    protected override activate(): void {
        this.controllerManager.onControllerFamilyChange.connect(this.updateControllerData, this);
        this.controllerManager.onGamepadStyleChange.connect(this.updateControllerData, this);
    }

    /** @inheritDoc */
    protected override deactivate(): void {
        this.controllerManager.onGamepadStyleChange.disconnect(this.updateControllerData, this);
        this.controllerManager.onControllerFamilyChange.disconnect(this.updateControllerData, this);
    }

    private updateControllerData(): void {
        this.icon.setAseprite(this.controllerSpriteMapRecords[this.controllerManager.controllerSprite]);
        this.updateLayout();
    }

    private updateLayout(): void {
        const iconWidth = this.icon.getWidth();
        this.label.setX(iconWidth + this.gap);
        this.resizeTo(
            iconWidth + this.gap + this.label.getWidth(),
            Math.max(this.icon.getHeight(), this.label.getHeight())
        );
    }
}
