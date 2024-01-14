import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { CollidableGameObject, GameScene } from "../scenes/GameScene";
import { entity } from "../Entity";
import { Environment } from "../World";
import { EyeType, Face, FaceModes } from "../Face";
import { GameObjectInfo } from "../MapInfo";
import { now } from "../util";
import { NPC } from "./NPC";
import { QuestATrigger, QuestKey } from "../Quests";
import { RenderingLayer } from "../Renderer";
import { Sound } from "../audio/Sound";

export enum StoneState {
    DEFAULT = 0,
    SWIMMING = 1,
    FLOATING = 2
}

@entity("stone")
export class Stone extends NPC implements CollidableGameObject {
    @asset("sprites/stone.aseprite.json")
    private static readonly sprite: Aseprite;

    @asset("sounds/throwing/success.mp3")
    private static readonly successSound: Sound;

    private readonly floatingPosition: GameObjectInfo;

    public state: StoneState = StoneState.DEFAULT;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 26, 50);

        this.direction = -1;
        this.face = new Face(scene, this, EyeType.STONE, 0, 21);
        this.lookAtPlayer = false;
        this.carryHeight = 16;

        const floatingPosition = this.scene.pointsOfInterest.find(
            poi => poi.name === "stone_floating_position"
        );

        if (!floatingPosition) {
            throw new Error("Could not find \"stone_floating_position\" point of interest in game scene");
        }

        this.floatingPosition = floatingPosition;
    }

    protected override showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        return (
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.PLANTED_SEED &&
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.GOT_STONE
        );
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(
            Stone.sprite,
            "idle",
            this.x, this.y - 1,
            RenderingLayer.ENTITIES,
            this.direction
        );

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        this.drawFace(ctx, false);

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        this.speechBubble.draw(ctx);
    }

    public override update(dt: number): void {
        super.update(dt);

        if (this.state === StoneState.DEFAULT) {
            if (
                this.scene.world.collidesWith(this.x, this.y - 5) === Environment.WATER
            ) {
                this.scene.game.campaign.getQuest(QuestKey.A).trigger(
                    QuestATrigger.THROWN_STONE_INTO_WATER
                );

                this.state = StoneState.SWIMMING;
                this.setVelocity(0, 0);
                this.setFloating(true);
                this.y = this.floatingPosition.y;
                Stone.successSound.play();
                this.scene.game.campaign.runAction("enable", null, ["stone", "stone2"]);
                this.scene.game.campaign.runAction("enable", null, ["flameboy", "flameboy2"]);
                this.scene.game.campaign.runAction("enable", null, ["caveman", "caveman2"]);
            }
        } else if (this.state === StoneState.SWIMMING) {
            const diffX = this.floatingPosition.x - this.x;
            this.direction = Math.sign(diffX);
            const moveX = Math.min(20, Math.abs(diffX)) * Math.sign(diffX);
            this.x += moveX * dt;

            if (Math.abs(moveX) < 2) {
                this.state = StoneState.FLOATING;
            }

            this.setVelocityY(Math.abs(((now() % 2000) - 1000) / 1000) - 0.5);
        } else if (this.state === StoneState.FLOATING) {
            this.x = this.floatingPosition.x;
            this.direction = -1;
            this.setVelocityY(Math.abs(((now() % 2000) - 1000) / 1000) - 0.5);
        }

        this.dialoguePrompt.update(dt, this.x, this.y + 48);
        this.speechBubble.update(this.x, this.y);
    }

    public collidesWith(x: number, y: number): number {
        if (this.state === StoneState.FLOATING || this.state === StoneState.SWIMMING) {
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

    public isCarried(): boolean {
        return this.scene.player.isCarrying(this);
    }

    public pickUp(): void {
        this.face?.setMode(FaceModes.AMUSED);
        this.scene.player.carry(this);
        this.scene.game.campaign.runAction("enable", null, ["flameboy", "flameboy4"]);
    }

    public dropInWater(): void {
        this.x = this.floatingPosition.x;
        this.y = this.floatingPosition.y;
    }
}
