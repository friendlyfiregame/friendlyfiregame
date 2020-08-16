import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { entity } from './Entity';
import { GameScene } from './scenes/GameScene';
import { NPC } from './NPC';
import { Point, Size } from './Geometry';
import { QuestATrigger, QuestKey } from './Quests';
import { RenderingLayer, RenderingType } from './Renderer';

enum AnimationTag {
    INVISIBLE = "invisible",
    IDLE = "idle"
}

@entity("shadowpresence")
export class ShadowPresence extends NPC {
    @asset("sprites/shadowpresence.aseprite.json")
    private static sprite: Aseprite;
    private isNearPlayer = false;

    public constructor(scene: GameScene, position: Point) {
        super(scene, position, new Size(12, 46));
        this.direction = -1;
        this.lookAtPlayer = false;
    }

    protected showDialoguePrompt (): boolean {
        if (!super.showDialoguePrompt()) return false;
        return (
            this.isNearPlayer &&
            this.scene.game.campaign.getQuest(QuestKey.A).isTriggered(QuestATrigger.TALKED_TO_FIRE) &&
            !this.scene.game.campaign.getQuest(QuestKey.A).isTriggered(QuestATrigger.GOT_RUNNING_ABILITY)
        );
    }

    draw(ctx: CanvasRenderingContext2D): void {
        let scale = this.direction < 0 ? new Point(-1, 1) : undefined;
        const animationTag = this.isNearPlayer ? AnimationTag.IDLE : AnimationTag.INVISIBLE;

        this.scene.renderer.add({
            type: RenderingType.ASEPRITE,
            layer: RenderingLayer.ENTITIES,
            translation: new Point(this.position.x, -this.position.y),
            position: new Point(
                -ShadowPresence.sprite.width >> 1,
                -ShadowPresence.sprite.height
            ),
            scale,
            asset: ShadowPresence.sprite,
            animationTag,
            time: this.scene.gameTime * 1000
        });

        if (this.scene.showBounds) this.drawBounds();
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    checkPlayerDistance (): void {
        this.isNearPlayer = false;
        if (this.distanceTo(this.scene.player) < 60) {
            this.isNearPlayer = true;
        }
    }

    update(dt: number): void {
        super.update(dt);
        this.checkPlayerDistance();
        this.dialoguePrompt.update(dt, this.position.clone().moveYBy(48));
        this.speechBubble.update(new Point(this.position.x, this.position.y + 12));
    }
}
