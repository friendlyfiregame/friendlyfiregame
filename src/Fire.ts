import { NPC } from './NPC';
import { Game } from './game';
import { PIXEL_PER_METER } from './constants';
import { rnd } from './util';
import { particles, ParticleEmitter } from './Particles';

export class Fire extends NPC {

    // private intensity = 5;

    private growth = 0;

    private emitter: ParticleEmitter;

    public constructor(game: Game, x: number, y: number) {
        super(game, x, y, 0.5 * PIXEL_PER_METER, 1.85 * PIXEL_PER_METER);
        this.emitter = particles.createEmitter(
            this.x, this.y,
            () => ({ x: rnd(-1, 1), y: rnd(-0.5) }),
            "#401605",
            4,
            {x: 0, y: 7},
            () => rnd(3, 7),
            1,
            "screen"
        );
    }



    async load(): Promise<void> {
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.strokeText("NPC", this.x - (this.width / 2), -this.y - this.height);
        ctx.strokeRect(this.x - (this.width / 2), -this.y - this.height, this.width, this.height);
        ctx.restore();
    }

    update(dt: number): void {
        if (this.growth !== 0) {
            // this.intensity += this.growth * dt;
        }
        let particleChance = dt - Math.random() * 0.2;
        while (particleChance > 0) {
            this.emitParticle();
            particleChance -= Math.random() * 0.2;
        }
    }

    startDialog(): void {
    }

    private emitParticle() {
        // const x = this.x + rnd(-1, 1) * this.intensity;
        // const y = this.y - rnd(0.5) * this.intensity;
        this.emitter.emit(0, 0);
    }
}
