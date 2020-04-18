import { GRAVITY } from './constants';

type ParticleAppearance = string | HTMLImageElement | HTMLCanvasElement;

type Vector2 = {x: number, y: number};

type NumberGenerator = () => number;

type VectorGenerator = () => Vector2;

type ParticleAppearanceGenerator = () => ParticleAppearance;

export class Particles {
    private emitters: ParticleEmitter[] = [];

    constructor() {

    }

    public async load(): Promise<void> {
    }

    public update(dt: number): void {
        this.emitters.forEach(emitter => emitter.update(dt));
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.emitters.forEach(emitter => emitter.draw(ctx));
    }

    public addEmitter(emitter: ParticleEmitter): void {
        this.emitters.push(emitter);
    }

    public dropEmitter(emitter: ParticleEmitter): boolean {
        const index = this.emitters.indexOf(emitter);
        if (index >= 0) {
            this.emitters.splice(index, 1);
            return true;
        }
        return false;
    }

    public createEmitter(
        x: number,
        y: number,
        velocityGenerator: Vector2 | VectorGenerator = () => ({x: 0, y: 0}),
        colorGenerator: ParticleAppearance | ParticleAppearanceGenerator = () => "white",
        sizeGenerator: number | NumberGenerator = () => 4,
        gravity: Vector2 | VectorGenerator = {x: 0, y: GRAVITY},
        lifetimeGenerator: number | NumberGenerator = 5,
        breakFactor = 1,
        blendMode = "source-over"
    ) {
        const emitter = new ParticleEmitter(x, y, velocityGenerator, colorGenerator, sizeGenerator, gravity,
                lifetimeGenerator, breakFactor, blendMode);
        this.addEmitter(emitter);
        return emitter;
    }

}
export const particles = new Particles();

export class ParticleEmitter {
    private particles: Particle[];
    private velocityGenerator: VectorGenerator;
    private colorGenerator: ParticleAppearanceGenerator;
    private sizeGenerator: NumberGenerator;
    private gravityGenerator: VectorGenerator;
    private lifetimeGenerator: NumberGenerator;
    public gravity: Vector2;

    constructor(
        public x: number,
        public y: number,
        velocityGenerator: Vector2 | VectorGenerator = ({x: 0, y: 0}),
        colorGenerator: ParticleAppearance | ParticleAppearanceGenerator = "white",
        sizeGenerator: number | NumberGenerator = 4,
        gravityGenerator: Vector2 | VectorGenerator = {x: 0, y: GRAVITY},
        lifetimeGenerator: number | NumberGenerator = 5,
        public breakFactor = 1,
        private blendMode = "source-over"
    ) {
        this.particles = [];
        this.velocityGenerator = toGenerator(velocityGenerator);
        this.colorGenerator = toGenerator(colorGenerator);
        this.sizeGenerator = toGenerator(sizeGenerator);
        this.gravityGenerator = toGenerator(gravityGenerator);
        this.gravity = this.gravityGenerator();
        this.lifetimeGenerator = toGenerator(lifetimeGenerator);

        function toGenerator<tp>(obj: tp | (() => tp)): (() => tp) {
            if (obj instanceof Function) {
                return obj;
            } else {
                return () => obj;
            }
        }
    }

    public emit(offX = 0, offY = 0): Particle {
        const v = this.velocityGenerator();
        const particle = new Particle(
            this,
            this.x + offX,
            this.y + offY,
            v.x,
            v.y,
            this.colorGenerator(),
            this.sizeGenerator(),
            this.lifetimeGenerator()
        );
        this.particles.push(particle);
        return particle;
    }

    public update(dt: number): void {
        this.gravity = this.gravityGenerator();
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].update(dt)) {
                this.particles.splice(i, 1);
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const prevBlendMode = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = this.blendMode;
        this.particles.forEach(p => p.draw(ctx));
        ctx.globalCompositeOperation = prevBlendMode;
    }
}

export class Particle {

    private halfSize: number;

    constructor(
        private emitter: ParticleEmitter,
        public x: number,
        public y: number,
        public vx = 0,
        public vy = 0,
        private imageOrColor: ParticleAppearance = "white",
        private size = 4,
        private lifetime = 1
    ) {
        this.halfSize = this.size / 2;
    }

    public update(dt: number): boolean {
        // Life
        this.lifetime -= dt;
        if (this.lifetime <= 0) {
            // Tell parent that it may eliminate this particle
            return true;
        }

        // Gravity
        this.vx += this.emitter.gravity.x * dt;
        this.vy += this.emitter.gravity.y * dt;
        if (this.emitter.breakFactor !== 1) {
            const factor = this.emitter.breakFactor ** dt;
            this.vx *= factor;
            this.vy *= factor;
        }

        // Movement
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        return false;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.imageOrColor instanceof HTMLImageElement) {
            // Image
            // TODO
        } else {
            // Color
            ctx.fillStyle = (this.imageOrColor as string);
            ctx.fillRect(this.x - this.halfSize, -this.y - this.halfSize, this.size, this.size);
        }
    }
}
