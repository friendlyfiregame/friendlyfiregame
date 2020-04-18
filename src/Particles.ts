import { GRAVITY } from './constants';
import { Vector2 } from './util';

type ParticleAppearance = string | HTMLImageElement | HTMLCanvasElement;

type NumberGenerator = () => number;

type VectorGenerator = () => Vector2;

type ParticleAppearanceGenerator = () => ParticleAppearance;

export interface ParticleEmitterArguments {
    position: Vector2;
    offset?: Vector2 | VectorGenerator | undefined;
    velocity?: Vector2 | VectorGenerator | undefined;
    color?: ParticleAppearance | ParticleAppearanceGenerator | undefined;
    alpha?: number | NumberGenerator;
    size?: number | NumberGenerator | undefined;
    gravity?: Vector2 | VectorGenerator | undefined;
    lifetime?: number | NumberGenerator | undefined;
    breakFactor?: number | undefined;
    blendMode?: string | undefined;
};

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

    public createEmitter(args: ParticleEmitterArguments) {
        const emitter = new ParticleEmitter(args);
        this.addEmitter(emitter);
        return emitter;
    }

}
export const particles = new Particles();

export class ParticleEmitter {
    private particles: Particle[];
    private x: number;
    private y: number;
    private offsetGenerator: VectorGenerator;
    private velocityGenerator: VectorGenerator;
    private colorGenerator: ParticleAppearanceGenerator;
    private sizeGenerator: NumberGenerator;
    private gravityGenerator: VectorGenerator;
    private lifetimeGenerator: NumberGenerator;
    private alphaGenerator: NumberGenerator;
    public gravity: Vector2;
    public breakFactor: number;
    private blendMode: string;

    constructor(args: ParticleEmitterArguments) {
        this.particles = [];
        this.x = args.position.x;
        this.y = args.position.y;
        this.offsetGenerator = toGenerator(args.offset ?? ({x: 0, y: 0}));
        this.velocityGenerator = toGenerator(args.velocity ?? ({x: 0, y: 0}));
        this.colorGenerator = toGenerator(args.color ?? "white");
        this.alphaGenerator = toGenerator(args.alpha ?? 1);
        this.sizeGenerator = toGenerator(args.size ?? 4);
        this.gravityGenerator = toGenerator(args.gravity ?? {x: 0, y: GRAVITY});
        this.gravity = this.gravityGenerator();
        this.lifetimeGenerator = toGenerator(args.lifetime ?? 5);
        this.breakFactor = args.breakFactor || 1;
        this.blendMode = args.blendMode || "source-over";

        function toGenerator<tp>(obj: tp | (() => tp)): (() => tp) {
            if (obj instanceof Function) {
                return obj;
            } else {
                return () => obj;
            }
        }
    }

    public emit(): Particle {
        const v = this.velocityGenerator();
        const off = this.offsetGenerator();
        const particle = new Particle(
            this,
            this.x + off.x,
            this.y + off.y,
            v.x,
            v.y,
            this.colorGenerator(),
            this.sizeGenerator(),
            this.lifetimeGenerator(),
            this.alphaGenerator()
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
        ctx.save();
        ctx.globalCompositeOperation = this.blendMode;
        this.particles.forEach(p => p.draw(ctx));
        ctx.restore();
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
        private lifetime = 1,
        private alpha = 1
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
        ctx.globalAlpha = this.alpha;
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
