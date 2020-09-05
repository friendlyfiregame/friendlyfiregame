import { SceneNode, SceneNodeArgs } from "./SceneNode";
import { FriendlyFire } from "../FriendlyFire";
import { ControllerAnimationTags, ControllerSpriteMap } from "../input/ControllerFamily";
import { ControllerManager } from "../input/ControllerManager";
import { AsepriteNode } from "./AsepriteNode";
import { TextNode } from "./TextNode";
import { asset } from "../Assets";
import { Aseprite } from "../Aseprite";
import { Direction } from "../geom/Direction";
import { DIALOG_FONT } from "../constants";
import { BitmapFont } from "../BitmapFont";

export interface ControlTooltipArgs extends SceneNodeArgs {
    control: ControllerAnimationTags,
    label: string
}

export class ControlTooltipNode extends SceneNode<FriendlyFire> {
    @asset(DIALOG_FONT)
    private static font: BitmapFont;

    @asset([
        "sprites/buttons_keyboard.aseprite.json",
        "sprites/buttons_xbox.aseprite.json",
        "sprites/buttons_playstation.aseprite.json"
    ])
    private static buttons: Aseprite[];
    private controllerSpriteMapRecords: Record<ControllerSpriteMap, Aseprite> = {
        [ControllerSpriteMap.KEYBOARD]: ControlTooltipNode.buttons[0],
        [ControllerSpriteMap.XBOX]: ControlTooltipNode.buttons[1],
        [ControllerSpriteMap.PLAYSTATION]: ControlTooltipNode.buttons[2]
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
    protected activate(): void {
        this.controllerManager.onControllerFamilyChange.connect(this.updateControllerFamily, this);
    }

    /** @inheritDoc */
    protected deactivate(): void {
        this.controllerManager.onControllerFamilyChange.disconnect(this.updateControllerFamily, this);
    }

    private updateControllerFamily(): void {
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
