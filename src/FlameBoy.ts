import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { entity } from './Entity';
import { EyeType, Face, FaceModes } from './Face';
import { GameScene } from './scenes/GameScene';
import { NPC } from './NPC';
import { QuestATrigger, QuestKey } from './Quests';
import { RenderingLayer } from './Renderer';
import { Sound } from './Sound';
import { SoundEmitter } from './SoundEmitter';

@entity("flameboy")
export class FlameBoy extends NPC {
    @asset("sprites/flameboy.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/fire/fire2.ogg")
    private static fireAmbience: Sound;
    private soundEmitter: SoundEmitter;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 26, 54);
        this.face = new Face(scene, this, EyeType.FLAMEBOY, 0, 5);
        this.defaultFaceMode = FaceModes.BORED
        this.face.setMode(this.defaultFaceMode);
        this.soundEmitter = new SoundEmitter(this.scene, this.x, this.y, FlameBoy.fireAmbience, 0.7, 0.2);
    }

    protected showDialoguePrompt (): boolean {
        if (!super.showDialoguePrompt()) return false;

        return (
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.THROWN_STONE_INTO_WATER
            && this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.GOT_MULTIJUMP
        );
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const animationTag = 'idle';
        this.scene.renderer.addAseprite(FlameBoy.sprite, animationTag, this.x, this.y, RenderingLayer.ENTITIES, this.direction);

        if (this.scene.showBounds) this.drawBounds();

        this.drawFace(ctx, false);

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }

        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.dialoguePrompt.update(dt, this.x, this.y + 32);
        this.speechBubble.update(this.x, this.y);
        this.soundEmitter.update();
    }
}
