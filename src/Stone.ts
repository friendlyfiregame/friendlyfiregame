import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { CollidableGameObject, GameScene } from "./scenes/GameScene";
import { entity } from "./Entity";
import { Environment } from "./World";
import { EyeType, Face, FaceModes } from "./Face";
import { GameObjectInfo } from "./MapInfo";
import { now } from "./util";
import { NPC } from "./NPC";
import { QuestATrigger, QuestKey } from "./Quests";
import { RenderingLayer } from "./Renderer";
import { Sound } from "./Sound";

export enum StoneState {
    DEFAULT = 0,
    SWIMMING = 1,
    FLOATING = 2
}

@entity("stone")
export class Stone extends NPC implements CollidableGameObject {
    @asset("sprites/stone.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/throwing/success.mp3")
    private static successSound: Sound;

    private floatingPosition: GameObjectInfo;

    public state: StoneState = StoneState.DEFAULT;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 26, 50);
        this.setLayer(RenderingLayer.ENTITIES);
        this.direction = -1;
        this.face = new Face(scene, EyeType.STONE, 0, 21);
        this.lookAtPlayer = false;
        this.carryHeight = 16;

        const floatingPosition = this.scene.pointsOfInterest.find(
            poi => poi.name === "stone_floating_position"
        );

        if (!floatingPosition) {
            throw new Error ("Could not find \"stone_floating_position\" point of interest in game scene");
        }

        this.floatingPosition = floatingPosition;
    }

    protected showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        return (
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.PLANTED_SEED &&
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.GOT_STONE
        );
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.drawAseprite(
            ctx,
            Stone.sprite,
            "idle",
            0, -1,
            this.direction
        );

        this.drawFace(ctx, false);
    }

    public update(dt: number): void {
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

        this.dialoguePrompt.updatePosition(0, 48);
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
    }
}
