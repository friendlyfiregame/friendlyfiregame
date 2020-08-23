import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { CollidableGameObject, GameScene } from './scenes/GameScene';
import { entity } from './Entity';
import { Environment } from './World';
import { EyeType, Face, FaceModes } from './Face';
import { GameObjectInfo } from './MapInfo';
import { now } from './util';
import { NPC } from './NPC';
import { Point, Size } from './Geometry';
import { QuestATrigger, QuestKey } from './Quests';
import { RenderingLayer } from './Renderer';
import { Sound } from './Sound';

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

    public constructor(scene: GameScene, position: Point) {
        super(scene, position, new Size(26, 50));

        this.direction = -1;
        this.face = new Face(scene, this, EyeType.STONE, 0, 21);
        this.lookAtPlayer = false;
        this.carryHeight = 16;

        const floatingPosition = this.scene.pointsOfInterest.find(
            poi => poi.name === 'stone_floating_position'
        );

        if (!floatingPosition) {
            throw new Error ('Could not find "stone_floating_position" point of interest in game scene');
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
        this.scene.renderer.addAseprite(
            Stone.sprite,
            "idle",
            this.position.clone().moveUp(),
            RenderingLayer.ENTITIES,
            this.direction
        );

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        this.drawFace(ctx, false);

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }

        this.speechBubble.draw(ctx);
    }

    public update(dt: number): void {
        super.update(dt);

        if (this.state === StoneState.DEFAULT) {
            if (this.scene.world.collidesWith(new Point(this.position.x, this.position.y - 5)) === Environment.WATER) {
                this.scene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.THROWN_STONE_INTO_WATER);
                this.state = StoneState.SWIMMING;
                this.setVelocity(0, 0);
                this.setFloating(true);
                this.position.moveYTo(this.floatingPosition.position.y);
                Stone.successSound.play();
                this.scene.game.campaign.runAction("enable", null, ["stone", "stone2"]);
                this.scene.game.campaign.runAction("enable", null, ["flameboy", "flameboy2"]);
            }
        } else if (this.state === StoneState.SWIMMING) {
            const diffX = this.floatingPosition.position.x - this.position.x;
            this.direction = Math.sign(diffX);
            const moveX = Math.min(20, Math.abs(diffX)) * Math.sign(diffX);
            this.position.moveXBy(moveX * dt);

            if (Math.abs(moveX) < 2) {
                this.state = StoneState.FLOATING;
            }

            this.setVelocityY(Math.abs(((now() % 2000) - 1000) / 1000) - 0.5);
        } else if (this.state === StoneState.FLOATING) {
            this.position.moveXTo(this.floatingPosition.position.x);
            this.direction = -1;
            this.setVelocityY(Math.abs(((now() % 2000) - 1000) / 1000) - 0.5);
        }

        this.dialoguePrompt.update(dt, this.position.clone().moveYBy(48));
        this.speechBubble.update(this.position);
    }

    public collidesWith(position: Point): number {
        if (this.state === StoneState.FLOATING || this.state === StoneState.SWIMMING) {
            if (
                position.x >= this.position.x - this.size.width / 2
                && position.x <= this.position.x + this.size.width / 2
                && position.y >= this.position.y
                && position.y <= this.position.y + this.size.height
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
