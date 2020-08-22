import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { Conversation } from './Conversation';
import { entity } from './Entity';
import { Environment } from './World';
import { EyeType, Face } from './Face';
import { GameObjectInfo } from './MapInfo';
import { GameScene } from './scenes/GameScene';
import { now } from './util';
import { NPC } from './NPC';
import { Point, Size } from './Geometry';
import { QuestATrigger, QuestKey } from './Quests';
import { RenderingLayer } from './Renderer';
import { Sound } from './Sound';
import { Wood } from './Wood';

export enum SeedState {
    FREE = 0,
    PLANTED = 1,
    SWIMMING = 2,
    GROWN = 3
}

@entity("seed")
export class Seed extends NPC {
    @asset("sprites/seed.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/throwing/success.mp3")
    private static successSound: Sound;

    public state = SeedState.FREE;
    private wood: Wood;
    private floatingPosition: GameObjectInfo;

    public constructor(scene: GameScene, position: Point) {
        super(scene, position, new Size(24, 24));
        this.wood = new Wood(scene, position);
        this.face = new Face(scene, this, EyeType.STANDARD, 0, 8);

        const floatingPosition = this.scene.pointsOfInterest.find(poi => poi.name === 'recover_floating_position');
        if (!floatingPosition) throw new Error ('Could not find "recover_floating_position" point of interest in game scene');
        this.floatingPosition = floatingPosition;
    }

    private getSpriteTag(): string {
        switch (this.state) {
            case SeedState.PLANTED:
                return "planted";
            case SeedState.GROWN:
                return "grown";
            default:
                return "free";
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(Seed.sprite, this.getSpriteTag(), new Point(this.position.x, this.position.y - 1), RenderingLayer.ENTITIES, undefined)

        if (this.scene.showBounds) this.drawBounds();
        if (this.state === SeedState.GROWN) {
            this.drawFace(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    public isCarried(): boolean {
        return this.scene.player.isCarrying(this);
    }

    public grow(): void {
        if (this.state === SeedState.PLANTED) {
            this.state = SeedState.GROWN;
            this.scene.seed = this;
            Conversation.setGlobal("seedgrown", "true");
            this.scene.game.campaign.runAction("enable", null, ["tree", "tree2"]);
            this.scene.game.campaign.runAction("enable", null, ["seed", "seed1"]);
        }
    }

    update(dt: number): void {
        super.update(dt);
        if (this.state === SeedState.SWIMMING) {
            const diffX = this.floatingPosition.position.x - this.position.x;
            const moveX = Math.min(20, Math.abs(diffX)) * Math.sign(diffX);
            this.position.moveXBy(moveX * dt);
            this.setVelocityY(Math.abs(((now() % 2000) - 1000) / 1000) - 0.5);
        }
        if (this.state === SeedState.FREE || this.state === SeedState.SWIMMING) {
            const player = this.scene.player;
            if (!this.isCarried() && this.distanceTo(player) < 20) {
                player.carry(this);
            }
            if (
                !this.isCarried()
                && this.scene.world.collidesWith(
                    new Point(this.position.x, this.position.y - 8)
                ) === Environment.SOIL
            ) {
                const seedPosition = this.scene.pointsOfInterest.find(poi => poi.name === 'seedposition');

                if (!seedPosition) throw new Error('Seed position is missing in points of interest array');

                this.state = SeedState.PLANTED;
                this.scene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.PLANTED_SEED);
                this.setFloating(true);

                this.position.moveTo(
                    seedPosition.position.x,
                    seedPosition.position.y
                );

                Seed.successSound.play();
                Conversation.setGlobal("seedplanted", "true");
            }

            if (
                !this.isCarried()
                && this.state !== SeedState.SWIMMING
                && this.scene.world.collidesWith(
                    new Point(this.position.x, this.position.y - 5)
                ) === Environment.WATER
            ) {
                this.state = SeedState.SWIMMING;
                this.setVelocity(0, 0);
                this.setFloating(true);
                this.position.moveXTo(this.floatingPosition.position.y);
            }
        } else if (this.state === SeedState.PLANTED) {
            if (this.scene.world.isRaining()) {
                this.grow();
            }
        } else if (this.state === SeedState.GROWN) {
            // TODO Special update behavior when grown
        }

        this.speechBubble.update(this.position);
    }

    public spawnWood(): Wood {
        if (!this.scene.gameObjects.includes(this.wood)) {
            this.scene.addGameObject(this.wood);
        }

        this.wood.position.moveTo(this.position.clone().moveYBy(this.size.height / 2));

        this.wood.setVelocity(-5, 0);

        return this.wood;
    }

    startDialog(): void {}
}
