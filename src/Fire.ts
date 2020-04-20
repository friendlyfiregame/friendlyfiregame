import { NPC } from './NPC';
import { Game } from './game';
import { PIXEL_PER_METER } from './constants';
import { rnd, rndInt, shiftValue } from './util';
import { particles, ParticleEmitter, valueCurves } from './Particles';
import { Face, EyeType, FaceModes } from './Face';
import { FireGfx } from './FireGfx';
import { entity } from "./Entity";
import { loadImage } from './graphics';
import { Wood } from "./Wood";

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
    public intensity = 5;

    public angry = false; // fire will be angry once wood was fed

    public growthTarget = 5;

    public growth = 1;

    private averageParticleDelay = 0.1;

    private isVisible = true;

    private fireGfx!: FireGfx;
    private smokeImage!: HTMLImageElement;

    // private fireEmitter: ParticleEmitter;
    private sparkEmitter: ParticleEmitter;
    private smokeEmitter: ParticleEmitter;

    public constructor(game: Game, x: number, y: number) {
        super(game, x, y, 0.5 * PIXEL_PER_METER, 1.85 * PIXEL_PER_METER);
        this.smokeEmitter = particles.createEmitter({
            position: {x: this.x, y: this.y},
            offset: () => ({ x: rnd(-1, 1) * 3 * this.intensity, y: rnd(2) * this.intensity }),
            velocity: () => ({ x: rnd(-1, 1) * 15, y: 4 + rnd(3) }),
            color: () => this.smokeImage,
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
        this.face = new Face(this, EyeType.STANDARD, 1, 0, 6);
    }



    async load(): Promise<void> {
        this.fireGfx = new FireGfx();
        this.smokeImage = await loadImage("sprites/smoke.png");
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
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        if (this.angry) {
            this.face?.setMode(FaceModes.ANGRY);
        }
        if (this.intensity !== this.growthTarget) {
            this.intensity = shiftValue(this.intensity, this.growthTarget, this.growth * dt);
        }
        if (!this.game.camera.isPointVisible(this.x, this.y, 200)) {
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
        this.speechBubble.update(this.x, this.y);
    }

    public feed(wood: Wood) {
        wood.remove();
        // Handle end of the world
        this.angry = true;
        this.growthTarget = 14;
        this.face?.setMode(FaceModes.ANGRY);
        this.game.music[0].setVolume(0);
        this.game.music[0].stop();
        this.game.music[1].setLoop(true);
        this.game.music[1].play();
        // Disable remaining dialogs
        this.conversation = null;
        // Disable all other characters
        for (const npc of [this.game.tree, this.game.stone, this.game.seed, this.game.flameboy]) {
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
            this.game.player.think(line[0] as string, line[2] as number * 1000);
        }, (line[1] as number) * 1000));
        // Give fire new dialog
        setTimeout(() => {
            this.game.campaign.runAction("enable", null, ["fire", "fire2"]);
        }, 13500);
    }
}
