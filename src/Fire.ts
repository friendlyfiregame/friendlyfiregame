import { NPC } from './NPC';
import { Game } from './game';
import { PIXEL_PER_METER } from './constants';
import { rnd, rndItem, rndInt } from './util';
import { particles, ParticleEmitter, valueCurves } from './Particles';
import { Face } from './Face';
import { FireGfx } from './FireGfx';

const fireColors = [
    "#603015",
    "#601004",
    "#604524",
    "#500502"
];

const smokeColors = [
    "#555",
    "#444",
    "#333"
];

export class Fire extends NPC {

    private intensity = 5;

    private growth = 0;

    private averageParticleDelay = 0.1;

    private fireGfx!: FireGfx;

    // private fireEmitter: ParticleEmitter;
    private sparkEmitter: ParticleEmitter;
    private smokeEmitter: ParticleEmitter;

    public constructor(game: Game, x: number, y: number) {
        super(game, x, y, 0.5 * PIXEL_PER_METER, 1.85 * PIXEL_PER_METER);
        this.smokeEmitter = particles.createEmitter({
            position: {x: this.x, y: this.y},
            offset: () => ({ x: rnd(-1, 1) * 3 * this.intensity, y: rnd(2) * this.intensity }),
            velocity: () => ({ x: rnd(-1, 1) * 15, y: 4 + rnd(3) }),
            color: () => rndItem(smokeColors),
            size: () => rndInt(14, 24),
            gravity: {x: 0, y: 10},
            lifetime: () => rnd(5, 8),
            alpha: () => rnd(0.3, 0.7),
            angleSpeed: () => rnd(-1, 1) * 1.5,
            blendMode: "source-over",
            alphaCurve: valueCurves.cos(0.1, 0.5),
            breakFactor: 0.9
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
            color: () => "#fff0c0" + rndItem("3456789abcdef") + "0",
            size: 2,
            gravity: {x: 0, y: -100},
            lifetime: () => rnd(1, 1.5),
            blendMode: "screen",
            alphaCurve: valueCurves.trapeze(0.05, 0.2)
        });
        this.face = new Face(this, 1, 0, 6);
    }



    async load(): Promise<void> {
        this.fireGfx = new FireGfx();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.fireGfx.draw(ctx, this.x, this.y);
        this.drawFace(ctx);
    }

    update(dt: number): void {
        if (this.growth !== 0) {
            this.intensity += this.growth * dt;
        }
        let particleChance = dt - rnd() * this.averageParticleDelay;
        while (particleChance > 0) {
            // this.fireEmitter.emit();
            if (rnd() < 0.12) {
                this.face?.toggleDirection();
            }
            if (rnd() < 0.05) {
                this.face?.setMode(Math.floor(Math.random() * 4));
            }
            if (rnd() < 0.3) {
                this.sparkEmitter.emit();
            }
            if (rnd() < 0.25) {
                this.smokeEmitter.emit();
            }
            particleChance -= rnd() * this.averageParticleDelay;
        }
        this.fireGfx.update(dt);
    }

    startDialog(): void {
    }
}
