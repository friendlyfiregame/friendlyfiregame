import { asset } from './Assets';
import { PIXEL_PER_METER } from './constants';
import { entity } from './Entity';
import { Face, EyeType, FaceModes } from './Face';
import { FireGfx } from './FireGfx';
import { GameScene } from './scenes/GameScene';
import { NPC } from './NPC';
import { ParticleEmitter, valueCurves } from './Particles';
import { Point, Size } from './Geometry';
import { QuestATrigger, QuestKey } from './Quests';
import { rnd, rndInt, shiftValue } from './util';
import { RenderingLayer, RenderingType } from './Renderer';
import { Wood } from './Wood';

@entity("fire")
export class Fire extends NPC {
    @asset("sprites/smoke.png")
    private static smokeImage: HTMLImageElement;

    public intensity = 5;

    public angry = false; // fire will be angry once wood was fed

    public growthTarget = 5;

    public growth = 1;

    private averageParticleDelay = 0.1;

    private isVisible = true;

    private fireGfx = new FireGfx();

    private sparkEmitter: ParticleEmitter;
    private smokeEmitter: ParticleEmitter;

    public constructor(scene: GameScene, position: Point) {
        super(scene, position, new Size(1.5 * PIXEL_PER_METER, 1.85 * PIXEL_PER_METER));
        this.smokeEmitter = this.scene.particles.createEmitter({
            position: this.position,
            offset: () => new Point(rnd(-1, 1) * 3 * this.intensity, rnd(2) * this.intensity),
            velocity: () => new Point(rnd(-1, 1) * 15, 4 + rnd(3)),
            color: () => Fire.smokeImage,
            size: () => rndInt(24, 32),
            gravity: new Point(0, 8),
            lifetime: () => rnd(5, 8),
            alpha: () => rnd(0.2, 0.45),
            angleSpeed: () => rnd(-1, 1) * 1.5,
            blendMode: "source-over",
            alphaCurve: valueCurves.cos(0.1, 0.5),
            breakFactor: 0.85
        })
        this.sparkEmitter = this.scene.particles.createEmitter({
            position: this.position,
            velocity: () => new Point(rnd(-1, 1) * 30, rnd(50, 100)),
            color: () => FireGfx.gradient.getCss(rnd() ** 0.5),
            size: 2,
            gravity: new Point(0, -100),
            lifetime: () => rnd(1, 1.5),
            blendMode: "screen",
            alpha: () => rnd(0.3, 1),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });
        this.face = new Face(scene, this, EyeType.STANDARD, 0, 6);
    }

    public showDialoguePrompt (): boolean {
        if (!super.showDialoguePrompt()) return false;
        return (
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() === QuestATrigger.JUST_ARRIVED ||
            (
                this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() >= QuestATrigger.GOT_WOOD &&
                this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() < QuestATrigger.TALKED_TO_FIRE_WITH_WOOD
            ) ||
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() === QuestATrigger.THROWN_WOOD_INTO_FIRE ||
            this.scene.game.campaign.getQuest(QuestKey.A).getHighestTriggerIndex() === QuestATrigger.BEAT_FIRE
        );
    }

    public isRendered (): boolean {
        return this.isVisible;
    }

    public drawToCanvas (ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.position.x, -this.position.y);
        ctx.scale(this.intensity / 5, this.intensity / 5);

        this.fireGfx.draw(ctx, Point.ORIGIN);

        ctx.restore();
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible) return;
        this.scene.renderer.add({ type: RenderingType.FIRE, layer: RenderingLayer.ENTITIES, entity: this })

        this.drawFace(ctx);
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        this.speechBubble.draw(ctx);
        if (this.scene.showBounds) this.drawBounds();
    }

    update(dt: number): void {
        if (this.angry) {
            this.face?.setMode(FaceModes.ANGRY);
        }
        if (this.intensity !== this.growthTarget) {
            this.intensity = shiftValue(this.intensity, this.growthTarget, this.growth * dt);
        }

        if (!this.scene.camera.isPointVisible(this.position.x, this.position.y, 200)) {
            this.isVisible = false;
            return;
        }

        this.isVisible = true;
        let particleChance = dt - rnd() * this.averageParticleDelay;
        while (particleChance > 0) {
            if (rnd() < 0.5) {
                this.sparkEmitter.emit();
            }
            if (rnd() < 0.32) {
                this.smokeEmitter.emit();
            }
            particleChance -= rnd() * this.averageParticleDelay;
        }
        if (this.isVisible) {
            this.fireGfx.update(dt);
        }
        if (this.showDialoguePrompt()) {
            this.dialoguePrompt.update(dt, this.position.x, this.position.y + 32);
        }
        this.speechBubble.update(this.position);
    }

    public feed(wood: Wood) {
        wood.remove();
        // Handle end of the world
        this.angry = true;
        this.growthTarget = 14;
        this.face?.setMode(FaceModes.ANGRY);

        this.scene.startApocalypseMusic();

        // Disable remaining dialogs
        this.conversation = null;

        // Remove any reachable NPCs
        for (const npc of [this.scene.spider, this.scene.shadowPresence]) {
            if (npc) {
                this.scene.removeGameObject(npc);
            }
        }

        // Player thoughts
        [
            ["What…", 2, 2],
            ["What have I done?", 6, 3],
            ["I trusted you! I helped you!", 10, 3]
        ].forEach(line => setTimeout(() => {
            this.scene.player.think(line[0] as string, line[2] as number * 1000);
        }, (line[1] as number) * 1000));
        // Give fire new dialog
        setTimeout(() => {
            this.scene.game.campaign.runAction("enable", null, ["fire", "fire2"]);
        }, 13500);
    }
}
