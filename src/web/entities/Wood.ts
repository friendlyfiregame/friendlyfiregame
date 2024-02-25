import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { type Sound } from "../audio/Sound";
import { type Entity, entity, type EntityArgs } from "../Entity";
import { Direction } from "../geom/Direction";
import { type ReadonlyVector2Like, Vector2 } from "../graphics/Vector2";
import { QuestATrigger, QuestKey } from "../Quests";
import { RenderingLayer } from "../Renderer";
import { AsepriteNode } from "../scene/AsepriteNode";
import { now } from "../util";
import { isInstanceOf } from "../util/predicates";
import { Environment } from "../World";
import { PhysicsEntity } from "./PhysicsEntity";
import { Pointer } from "./Pointer";

export enum WoodState {
    FREE = 0,
    SWIMMING = 1
}

@entity("Wood")
export class Wood extends PhysicsEntity {
    @asset("sprites/wood.aseprite.json")
    private static readonly sprite: Aseprite;

    @asset("sounds/throwing/success.mp3")
    private static readonly successSound: Sound;
    private floatingPosition: ReadonlyVector2Like = new Vector2();

    public state = WoodState.FREE;

    public constructor(args: EntityArgs) {
        super({
            ...args,
            width: Wood.sprite.width,
            height: Wood.sprite.height,
            reversed: true
        });
        this.appendChild(new AsepriteNode({
            aseprite: Wood.sprite,
            layer: RenderingLayer.ENTITIES,
            anchor: Direction.BOTTOM,
            hidden: true
        }));
    }

    public static spawn(target: Entity): Wood {
        const scene = target.scene;
        let wood = scene.rootNode.findDescendant(isInstanceOf(Wood)) as Wood | null;
        if (wood == null) {
            wood = new Wood({
                scene,
                x: target.x,
                y: target.y - target.height / 2,
            });
        } else {
            wood.x = target.x;
            wood.y = target.y - target.height / 2;
        }
        wood.resetState();
        wood.setVelocity(5, 0);
        scene.addGameObject(wood);
        scene.rootNode.appendChild(wood);
        return wood;
    }

    public override setup(): void {
        const floatingPosition = this.scene.findEntity(Pointer, "recover_floating_position");
        if (!floatingPosition) {
            throw new Error("Could not find \"recover_floating_position\" point of interest in game scene.");
        }
        this.floatingPosition = floatingPosition;
    }

    public resetState(): void {
        this.setFloating(false);
        this.state = WoodState.FREE;
    }

    public override render(): void {
        this.scene.renderer.addAseprite(Wood.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES);
    }

    public isCarried(): boolean {
        return this.scene.player.isCarrying(this);
    }

    protected override isPhysicsEnabled(): boolean {
        return !this.isCarried();
    }

    public override update(dt: number): void {
        super.update(dt);

        if (this.state === WoodState.SWIMMING) {
            const diffX = this.floatingPosition.x - this.x;
            const moveX = Math.min(20, Math.abs(diffX)) * Math.sign(diffX);
            this.x += moveX * dt;
            this.setVelocityY(-Math.abs(((now() % 2000) - 1000) / 1000) + 0.5);
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
                this.y = this.floatingPosition.y - 8;
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
