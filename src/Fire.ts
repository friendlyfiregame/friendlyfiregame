import { NPC } from './NPC';
import { Game } from './game';
import { PIXEL_PER_METER } from './constants';
import { rnd, rndItem, rndInt } from './util';
import { particles, ParticleEmitter } from './Particles';
import { Face } from './Face';

const fireColors = [
    "#603015",
    "#601004",
    "#604524",
    "#500502"
];

const smokeColors = [
    "#777",
    "#555",
    "#888"
];

export class Fire extends NPC {

    private intensity = 5;

    private growth = 0;

    private averageParticleDelay = 0.1;

    private fireEmitter: ParticleEmitter;
    private sparkEmitter: ParticleEmitter;
    private smokeEmitter: ParticleEmitter;

    public constructor(game: Game, x: number, y: number) {
        super(game, x, y, 0.5 * PIXEL_PER_METER, 1.85 * PIXEL_PER_METER);
        this.smokeEmitter = particles.createEmitter({
            position: {x: this.x, y: this.y},
            offset: () => ({ x: rnd(-1, 1) * 3 * this.intensity, y: rnd(2) * this.intensity }),
            velocity: () => ({ x: rnd(-1, 1) * 5, y: -2 - rnd(3) }),
            color: () => rndItem(smokeColors),
            size: () => rndInt(14, 18),
            gravity: {x: 0, y: 7},
            lifetime: () => rnd(3, 7),
            alpha: () => rnd(0.2, 0.5),
            blendMode: "source-over"
        })
        this.fireEmitter = particles.createEmitter({
            position: {x: this.x, y: this.y},
            offset: () => ({ x: rnd(-1, 1) * 3 * this.intensity, y: rnd(2) * this.intensity }),
            velocity: () => ({ x: rnd(-1, 1) * 5, y: rnd(-3) }),
            color: () => rndItem(fireColors),
            size: () => rndInt(10, 15),
            gravity: {x: 0, y: 10},
            lifetime: () => rnd(2, 4),
            blendMode: "screen"
        });
        this.sparkEmitter = particles.createEmitter({
            position: {x: this.x, y: this.y},
            velocity: () => ({ x: rnd(-1, 1) * 30, y: rnd(50, 100) }),
            color: () => "#fff0c0" + rndItem("3456789abcdef") + "0",
            size: 2,
            gravity: {x: 0, y: -100},
            lifetime: () => rnd(1, 1.5),
            blendMode: "screen"
        });
        this.face = new Face(this, 1, 0, 6);
    }



    async load(): Promise<void> {
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.drawFace(ctx);
    }

    update(dt: number): void {
        if (this.growth !== 0) {
            this.intensity += this.growth * dt;
        }
        let particleChance = dt - rnd() * this.averageParticleDelay;
        while (particleChance > 0) {
            this.fireEmitter.emit();
            if (rnd() < 0.12) {
                this.face?.toggleDirection();
            }
            if (rnd() < 0.05) {
                this.face?.setMode(Math.floor(Math.random() * 4));
            }
            if (rnd() < 0.3) {
                this.sparkEmitter.emit();
            }
            if (rnd() < 0.5) {
                this.smokeEmitter.emit();
            }
            particleChance -= rnd() * this.averageParticleDelay;
        }
    }

    startDialog(): void {
    }
}
