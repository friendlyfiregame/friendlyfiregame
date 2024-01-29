import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Sound } from "../audio/Sound";
import { entity, type EntityArgs } from "../Entity";
import { type ReadonlyVector2Like, Vector2 } from "../graphics/Vector2";
import { QuestATrigger, QuestKey } from "../Quests";
import { RenderingLayer } from "../Renderer";
import { now } from "../util";
import { isInstanceOf } from "../util/predicates";
import { Environment } from "../World";
import { PhysicsEntity } from "./PhysicsEntity";
import { RecoverFloatingPosition } from "./pointers/RecoverFloatingPosition";

export enum WoodState {
    FREE = 0,
    SWIMMING = 1
}

@entity("wood")
export class Wood extends PhysicsEntity {
    @asset("sprites/wood.aseprite.json")
    private static readonly sprite: Aseprite;

    @asset("sounds/throwing/success.mp3")
    private static readonly successSound: Sound;
    private floatingPosition: ReadonlyVector2Like = new Vector2();

    public state = WoodState.FREE;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 26, height: 16 });
    }

    public override setup(): void {
        const floatingPosition = this.scene.gameObjects.find(isInstanceOf(RecoverFloatingPosition));
        if (!floatingPosition) {
            throw new Error("Could not find \"recover_floating_position\" point of interest in game scene.");
        }
        this.floatingPosition = floatingPosition;
    }

    public resetState(): void {
        this.setFloating(false);
        this.state = WoodState.FREE;
    }

    public override draw(): void {
        this.scene.renderer.addAseprite(Wood.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES);
    }

    public isCarried(): boolean {
        return this.scene.player.isCarrying(this);
    }

    public override update(dt: number): void {
        super.update(dt);

        if (this.state === WoodState.SWIMMING) {
            const diffX = this.floatingPosition.x - this.x;
            const moveX = Math.min(20, Math.abs(diffX)) * Math.sign(diffX);
            this.x += moveX * dt;
            this.setVelocityY(Math.abs(((now() % 2000) - 1000) / 1000) - 0.5);
        }

        if (this.state === WoodState.FREE || this.state === WoodState.SWIMMING) {
            const player = this.scene.player;

            if (!this.isCarried() && this.distanceTo(player) < 20) {
                player.carry(this);
            }

            if (
                !this.isCarried()
                && this.state !== WoodState.SWIMMING
                && this.scene.world.collidesWith(this.x, this.y - 5) === Environment.WATER
            ) {
                this.state = WoodState.SWIMMING;
                this.setVelocity(0, 0);
                this.setFloating(true);
                this.y = this.floatingPosition.y + 8;
            }
        }

        if (!this.isCarried() && this.distanceTo(this.scene.fire) < 20) {
            void this.scene.fire.feed(this);
            this.scene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.THROWN_WOOD_INTO_FIRE);
            Wood.successSound.play();
        }

        if (!this.isCarried() && this.distanceTo(this.scene.flameboy) < 20) {
            this.scene.flameboy.feed(this);
            Wood.successSound.play();
        }
    }
}
