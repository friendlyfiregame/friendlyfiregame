import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import { entity } from "../Entity";
import { EyeType, Face } from "../Face";
import { GameScene } from "../scenes/GameScene";
import { NPC } from "./NPC";
import { RenderingLayer } from "../Renderer";
import { GameObjectInfo } from "../MapInfo";
import { now } from "../util";
import { Environment } from "../World";
import { LevelId } from "../Levels";

export enum StoneState {
    DEFAULT = 0,
    IN_WATER = 1
}

@entity("stonedisciple")
export class StoneDisciple extends NPC {
    @asset("sprites/stonedisciple.aseprite.json")
    private static sprite: Aseprite;

    private state: StoneState = StoneState.DEFAULT;
    private floatingPosition: GameObjectInfo;

    public constructor(scene: GameScene, x: number, y: number, levelId: LevelId) {
        super(scene, x, y, 32, 26, levelId);
        this.direction = -1;
        this.lookAtPlayer = true;
        this.face = new Face(scene, this, EyeType.STONEDISCIPLE, 0, 0);

        const pos = this.scene.pointsOfInterest.get("overworld")?.find(poi => poi.name === "stone_disciple_floating_position");
        if (!pos) throw new Error("Could not find \"stone_disciple_floating_position\" point of interest in game scene");
        this.floatingPosition = pos;
    }

    protected showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt())  return false;
        if (this.state === StoneState.IN_WATER) return false;

        const talkedToStoneDisciple = Conversation.getGlobals()["$talkedToStoneDisciple"];
        const talkedToStoneDiscipleAgain = Conversation.getGlobals()["$talkedToStoneDiscipleAgain"];
        const gotTeleported = Conversation.getGlobals()["$gotTeleported"];

        return (
            talkedToStoneDisciple === undefined
            || (gotTeleported !== undefined && talkedToStoneDiscipleAgain === undefined)
        );
    }

    public putIntoRiver (): void {
        this.state = StoneState.IN_WATER;
        this.setFloating(true);
        this.x = this.floatingPosition.x;
        this.y = this.floatingPosition.y;
        this.direction = 1;
        this.lookAtPlayer = false;
        this.scene.game.campaign.runAction("enable", null, ["stonedisciple", "stonedisciple3"]);
        this.dialogueAutomoveEnabled = false;
    }

    public collidesWith(x: number, y: number): number {
        if (this.state === StoneState.IN_WATER) {
            if (
                x >= this.x - this.width / 2
                && x <= this.x + this.width / 2
                && y >= this.y
                && y <= this.y + this.height
            ) {
                return Environment.SOLID;
            }
        }
        return Environment.AIR;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(
            StoneDisciple.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES, this.direction
        );

        this.drawFace(ctx, false);

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        this.speechBubble.draw(ctx);
    }

    public update(dt: number): void {
        super.update(dt);

        if (this.state === StoneState.DEFAULT) {
            // do nothing
        } else if (this.state === StoneState.IN_WATER) {
            this.x = this.floatingPosition.x;
            this.setVelocityY(Math.abs(((now() % 2000) - 1000) / 1000) - 0.5);
        }

        this.dialoguePrompt.update(dt, this.x, this.y + this.height);
        this.speechBubble.update(this.x, this.y);
    }
}
