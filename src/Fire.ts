import { NPC } from './NPC';
import { PIXEL_PER_METER } from './constants';
import { rnd, rndInt, shiftValue } from './util';
import { particles, ParticleEmitter, valueCurves } from './Particles';
import { Face, EyeType, FaceModes } from './Face';
import { FireGfx } from './FireGfx';
import { entity } from "./Entity";
import { Wood } from "./Wood";
import { asset } from "./Assets";
import { Milestone } from './Player';
import { GameScene } from "./scenes/GameScene";
import { FriendlyFire } from "./FriendlyFire";

// const fireColors = [
//     "#603015",
//     "#601004",
//     "#604524",
//     "#500502"
// ];

/*
const smokeColors = [
    "#555",
    "#444",
    "#333"
];
*/

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

    // private fireEmitter: ParticleEmitter;
    private sparkEmitter: ParticleEmitter;
    private smokeEmitter: ParticleEmitter;

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 0.5 * PIXEL_PER_METER, 1.85 * PIXEL_PER_METER);
        this.smokeEmitter = particles.createEmitter({
            position: {x: this.x, y: this.y},
            offset: () => ({ x: rnd(-1, 1) * 3 * this.intensity, y: rnd(2) * this.intensity }),
            velocity: () => ({ x: rnd(-1, 1) * 15, y: 4 + rnd(3) }),
            color: () => Fire.smokeImage,
            size: () => rndInt(24, 32),
            gravity: {x: 0, y: 8},
            lifetime: () => rnd(5, 8),
            alpha: () => rnd(0.2, 0.45),
            angleSpeed: () => rnd(-1, 1) * 1.5,
            blendMode: "source-over",
            alphaCurve: valueCurves.cos(0.1, 0.5),
            breakFactor: 0.85
        })
        // this.fireEmitter = particles.createEmitter({
        //     position: {x: this.x, y: this.y},
        //     offset: () => ({ x: rnd(-1, 1) * 3 * this.intensity, y: rnd(2) * this.intensity }),
        //     velocity: () => ({ x: rnd(-1, 1) * 5, y: rnd(-2, 3) }),
        //     color: () => rndItem(fireColors),
        //     size: () => rndInt(10, 15),
        //     gravity: {x: 0, y: 10},
        //     lifetime: () => rnd(2, 4),
        //     blendMode: "screen",
        //     alphaCurve: valueCurves.trapeze(0.05, 0.1)
        // });
        this.sparkEmitter = particles.createEmitter({
            position: {x: this.x, y: this.y},
            velocity: () => ({ x: rnd(-1, 1) * 30, y: rnd(50, 100) }),
            color: () => FireGfx.gradient.getCss(rnd() ** 0.5),
            size: 2,
            gravity: {x: 0, y: -100},
            lifetime: () => rnd(1, 1.5),
            blendMode: "screen",
            alpha: () => rnd(0.3, 1),
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });
        this.face = new Face(scene, this, EyeType.STANDARD, 0, 6);
    }

    public showDialoguePrompt (): boolean {
        return (
            this.scene.player.getMilestone() === Milestone.JUST_ARRIVED ||
            (
                this.scene.player.getMilestone() >= Milestone.GOT_WOOD &&
                this.scene.player.getMilestone() < Milestone.TALKED_TO_FIRE_WITH_WOOD
            )
        );
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible) {
            return;
        }
        ctx.save();
        ctx.translate(this.x, -this.y);
        ctx.scale(this.intensity / 5, this.intensity / 5);
        this.fireGfx.draw(ctx, 0, 0);
        ctx.restore();
        this.drawFace(ctx);
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        if (this.angry) {
            this.face?.setMode(FaceModes.ANGRY);
        }
        if (this.intensity !== this.growthTarget) {
            this.intensity = shiftValue(this.intensity, this.growthTarget, this.growth * dt);
        }
        if (!this.scene.camera.isPointVisible(this.x, this.y, 200)) {
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
            // console.log(dt);
            this.dialoguePrompt.update(dt, this.x, this.y + 32);
        }
        this.speechBubble.update(this.x, this.y);
    }

    public feed(wood: Wood) {
        wood.remove();
        // Handle end of the world
        this.angry = true;
        this.growthTarget = 14;
        this.face?.setMode(FaceModes.ANGRY);
        FriendlyFire.music[0].setVolume(0);
        FriendlyFire.music[0].stop();
        FriendlyFire.music[1].setLoop(true);
        FriendlyFire.music[1].play();
        // Disable remaining dialogs
        this.conversation = null;
        // Disable all other characters
        for (const npc of [this.scene.tree, this.scene.stone, this.scene.seed, this.scene.flameboy]) {
            if (npc) {
                npc.conversation = null;
                npc.face = null;
            }
        }
        // Player thoughts
        [
            ["What...", 2, 2],
            ["What have I done?", 6, 3],
            ["I trusted you! I helped you!", 10, 3]
        ].forEach(line => setTimeout(() => {
            this.scene.player.think(line[0] as string, line[2] as number * 1000);
        }, (line[1] as number) * 1000));
        // Give fire new dialog
        setTimeout(() => {
            this.scene.campaign.runAction("enable", null, ["fire", "fire2"]);
        }, 13500);
    }
}
