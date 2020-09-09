import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { Conversation } from "./Conversation";
import { entity } from "./Entity";
import { Environment } from "./World";
import { EyeType, Face } from "./Face";
import { GameObjectInfo } from "./MapInfo";
import { GameScene } from "./scenes/GameScene";
import { now } from "./util";
import { NPC } from "./NPC";
import { QuestATrigger, QuestKey } from "./Quests";
import { RenderingLayer } from "./RenderingLayer";
import { Sound } from "./Sound";
import { Wood } from "./Wood";

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

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 24, 24);
        this.setLayer(RenderingLayer.ENTITIES);
        this.wood = new Wood(scene, x, y);

        const floatingPosition = this.gameScene.pointsOfInterest.find(poi => poi.name === "recover_floating_position");

        if (!floatingPosition) {
            throw new Error ("Could not find “recover_floating_position” point of interest in game scene.");
        }

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

    public draw(ctx: CanvasRenderingContext2D): void {
        Seed.sprite.drawTag(ctx, this.getSpriteTag(), -Seed.sprite.width >> 1, -Seed.sprite.height + 1);
    }

    public isCarried(): boolean {
        return this.gameScene.player.isCarrying(this);
    }

    public grow(): void {
        if (this.state === SeedState.PLANTED) {
            this.state = SeedState.GROWN;
            this.gameScene.seed = this;
            this.face = new Face(this.gameScene, EyeType.STANDARD, false, 0, 8).appendTo(this);
            Conversation.setGlobal("seedgrown", "true");
            this.gameScene.game.campaign.runAction("enable", null, ["tree", "tree2"]);
            this.gameScene.game.campaign.runAction("enable", null, ["seed", "seed1"]);
        }
    }

    public update(dt: number): void {
        super.update(dt);

        if (this.state === SeedState.SWIMMING) {
            const diffX = this.floatingPosition.x - this.x;
            const moveX = Math.min(20, Math.abs(diffX)) * Math.sign(diffX);
            this.x += moveX * dt;
            this.setVelocityY(Math.abs(((now() % 2000) - 1000) / 1000) - 0.5);
        }

        if (this.state === SeedState.FREE || this.state === SeedState.SWIMMING) {
            const player = this.gameScene.player;

            if (!this.isCarried() && this.distanceTo(player) < 20) {
                player.carry(this);
            }
            if (
                !this.isCarried()
                && this.gameScene.world.collidesWith(this.x, this.y - 8) === Environment.SOIL
            ) {
                const seedPosition = this.gameScene.pointsOfInterest.find(poi => poi.name === "seedposition");

                if (!seedPosition) throw new Error("Seed position is missing in points of interest array");

                this.state = SeedState.PLANTED;
                this.gameScene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.PLANTED_SEED);
                this.setFloating(true);
                this.x = seedPosition.x;
                this.y = seedPosition.y;

                Seed.successSound.play();
                Conversation.setGlobal("seedplanted", "true");
            }

            if (
                !this.isCarried()
                && this.state !== SeedState.SWIMMING
                && this.gameScene.world.collidesWith(this.x, this.y - 5) === Environment.WATER
            ) {
                this.state = SeedState.SWIMMING;
                this.setVelocity(0, 0);
                this.setFloating(true);
                this.y = this.floatingPosition.y;
            }
        } else if (this.state === SeedState.PLANTED) {
            if (this.gameScene.world.isRaining()) {
                this.grow();
            }
        } else if (this.state === SeedState.GROWN) {
            // TODO Special update behavior when grown
        }
    }

    public spawnWood(): Wood {
        if (!this.wood.isInScene()) {
            this.gameScene.addGameObject(this.wood);
        }
        this.wood.x = this.x;
        this.wood.y = this.y + this.height / 2;
        this.wood.setVelocity(-5, 0);

        return this.wood;
    }

    public startDialog(): void {}
}
