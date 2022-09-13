import { Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { Conversation } from "../Conversation";
import { entity } from "../Entity";
import { Environment } from "../World";
import { GameScene } from "../scenes/GameScene";
import { PhysicsEntity } from "./PhysicsEntity";
import { RenderingLayer } from "../Renderer";
import { LevelId } from "../Levels";
import { Sound } from "../audio/Sound";

@entity("bone")
export class Bone extends PhysicsEntity {
    @asset("sprites/bone.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/throwing/success.mp3")
    private static successSound: Sound;

    public constructor(scene: GameScene, x: number, y: number, levelId: LevelId) {
        super(scene, x, y, 20, 10, levelId);
    }

    public draw(): void {
        this.scene.renderer.addAseprite(Bone.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES);

        if (this.scene.showBounds) {
            this.drawBounds();
        }
    }

    public isCarried(): boolean {
        return this.scene.player.isCarrying(this);
    }

    public update(dt: number): void {
        super.update(dt);

        const player = this.scene.player;

        if (!this.isCarried() && this.distanceTo(player) < 20) {
            player.carry(this);
        }

        if (!this.isCarried() && this.scene.world.collidesWith(this.x, this.y - 5) === Environment.WATER) {
            const vx = this.getVelocityX();
            this.setVelocity(vx, 10);
        }

        if (Conversation.getGlobals()["$gotBoneQuest"] && !this.isCarried() && this.distanceTo(this.scene.powerShiba) < 20) {
            Bone.successSound.play();
            this.scene.powerShiba.feed();
            this.scene.removeGameObject(this);
        }
    }
}
