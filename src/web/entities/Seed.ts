import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { type Sound } from "../audio/Sound";
import { Conversation } from "../Conversation";
import { type Entity, entity, type EntityArgs } from "../Entity";
import { EyeType, Face } from "../Face";
import { Direction } from "../geom/Direction";
import { type ReadonlyVector2Like, Vector2 } from "../graphics/Vector2";
import { QuestATrigger, QuestKey } from "../Quests";
import { RenderingLayer } from "../Renderer";
import { AsepriteNode } from "../scene/AsepriteNode";
import { now } from "../util";
import { isInstanceOf } from "../util/predicates";
import { Environment } from "../World";
import { NPC } from "./NPC";
import { Pointer } from "./Pointer";

export enum SeedState {
    FREE = 0,
    PLANTED = 1,
    SWIMMING = 2,
    GROWN = 3
}

@entity("Seed")
export class Seed extends NPC {
    @asset("sprites/seed.aseprite.json")
    private static readonly sprite: Aseprite;

    @asset("sounds/throwing/success.mp3")
    private static readonly successSound: Sound;

    public state = SeedState.FREE;
    private floatingPosition: ReadonlyVector2Like = new Vector2();
    private readonly asepriteNode: AsepriteNode;

    public constructor(args: EntityArgs) {
        super({ ...args, width: 24, height: 24 });
        this.face = new Face(this.scene, this, EyeType.STANDARD, 0, -8);
        this.asepriteNode = new AsepriteNode({
            aseprite: Seed.sprite,
            tag: this.getSpriteTag(),
            anchor: Direction.BOTTOM,
            layer: RenderingLayer.ENTITIES,
            y: 1,
        });
        this.appendChild(this.asepriteNode);
    }

    public static spawn(target: Entity): Seed {
        const scene = target.scene;
        let seed = scene.rootNode.findDescendant(isInstanceOf(Seed)) as Seed | null;
        if (seed == null) {
            seed = new Seed({
                scene,
                x: target.x,
                y: target.y - target.height / 2,
            });
        } else {
            seed.x = target.x;
            seed.y = target.y - target.height / 2;
        }
        seed.resetState();
        seed.setVelocity(5, 0);
        scene.addGameObject(seed);
        scene.rootNode.appendChild(seed);
        return seed;
    }

    public override setup(): void {
        const floatingPosition = this.scene.findEntity(Pointer, "recover_floating_position");
        if (!floatingPosition) {
            throw new Error("Could not find “recover_floating_position” point of interest in game scene.");
        }
        this.floatingPosition = floatingPosition;
    }

    public resetState(): void {
        this.setFloating(false);
        this.state = SeedState.FREE;
    }

    public bury(): void {
        const seedPosition = this.scene.findEntity(Pointer, "seedposition");
        if (!seedPosition) throw new Error("Seed position is missing in points of interest array");

        this.x = seedPosition.x;
        this.y = seedPosition.y;
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

    public override render(): void {
        if (this.state === SeedState.GROWN) {
            this.drawFace();
        }

        this.speechBubble.draw();
    }

    public isCarried(): boolean {
        return this.scene.player.isCarrying(this);
    }

    protected override isPhysicsEnabled(): boolean {
        return !this.isCarried();
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

    public override update(dt: number): void {
        super.update(dt);

        this.asepriteNode.setTag(this.getSpriteTag());

        if (this.state === SeedState.SWIMMING) {
            const diffX = this.floatingPosition.x - this.x;
            const moveX = Math.min(20, Math.abs(diffX)) * Math.sign(diffX);
            this.x += moveX * dt;
            this.setVelocityY(-Math.abs(((now() % 2000) - 1000) / 1000) + 0.5);
        }

        if (this.state === SeedState.FREE || this.state === SeedState.SWIMMING) {
            const player = this.scene.player;

            if (!this.isCarried() && this.distanceTo(player) < 20) {
                player.carry(this);
            }
            if (
                !this.isCarried()
                && this.scene.world.collidesWith(this.x, this.y + 8) === Environment.SOIL
            ) {
                const seedPosition = this.scene.findEntity(Pointer, "seedposition");

                if (!seedPosition) throw new Error("Seed position is missing in points of interest array");

                this.state = SeedState.PLANTED;
                this.scene.game.campaign.getQuest(QuestKey.A).trigger(QuestATrigger.PLANTED_SEED);
                this.setFloating(true);
                this.x = seedPosition.x;
                this.y = seedPosition.y;

                Seed.successSound.play();
                Conversation.setGlobal("seedplanted", "true");
            }

            if (
                !this.isCarried()
                && this.state !== SeedState.SWIMMING
                && this.scene.world.collidesWith(this.x, this.y + 5) === Environment.WATER
            ) {
                this.state = SeedState.SWIMMING;
                this.setVelocity(0, 0);
                this.setFloating(true);
                this.y = this.floatingPosition.y;
            }
        } else if (this.state === SeedState.PLANTED) {
            if (this.scene.world.isRaining()) {
                this.grow();
            }
        } else if (this.state === SeedState.GROWN) {
            // TODO Special update behavior when grown
        }

        this.speechBubble.update(this.x, this.y);
    }

    public startDialog(): void {}
}
