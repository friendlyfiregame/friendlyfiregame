import { GameScene } from "./scenes/GameScene";
import { GRAVITY } from "./constants";
import { RenderingLayer, RenderingType } from "./Renderer";
import { Vector2Like } from "./graphics/Vector2";

type ParticleAppearance = string | HTMLImageElement | HTMLCanvasElement;

type NumberGenerator = () => number;

type VectorGenerator = () => Vector2Like;

type ParticleAppearanceGenerator = () => ParticleAppearance;

export interface ParticleEmitterArguments {
    position: Vector2Like;
    offset?: Vector2Like | VectorGenerator;
    velocity?: Vector2Like | VectorGenerator;
    color?: ParticleAppearance | ParticleAppearanceGenerator;
    alpha?: number | NumberGenerator;
    size?: number | NumberGenerator;
    gravity?: Vector2Like | VectorGenerator;
    lifetime?: number | NumberGenerator;
    breakFactor?: number;
    blendMode?: GlobalCompositeOperation;
    alphaCurve?: ValueCurve;
    sizeCurve?: ValueCurve;
    angle?: number | NumberGenerator;
    angleSpeed?: number | NumberGenerator;
    renderingLayer?: RenderingLayer;
    zIndex?: number;
    update?: (p: Particle) => void;
}

export class Particles {
    private scene: GameScene;
    private emitters: ParticleEmitter[] = [];

    public constructor(scene: GameScene) {
        this.scene = scene;
    }

    public update(dt: number): void {
        this.emitters.forEach(emitter => emitter.update(dt));
    }

    public addEmittersToRenderingQueue(): void {
        this.emitters.forEach(emitter => {
            this.scene.renderer.add({
                type: RenderingType.PARTICLE_EMITTER,
                layer: emitter.renderingLayer,
                zIndex: emitter.zIndex,
                emitter
            });
        });
    }

    // Direct drawing of particles is deactivated since it's handled via rendering engine
    public draw(ctx: CanvasRenderingContext2D): void {}

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
    private angleGenerator: NumberGenerator;
    private angleSpeedGenerator: NumberGenerator;
    public gravity: Vector2Like;
    public breakFactor: number;
    private blendMode: GlobalCompositeOperation;
    public alphaCurve: ValueCurve;
    public sizeCurve: ValueCurve;
    public renderingLayer: RenderingLayer;
    public zIndex: number;
    private updateMethod: ((p: Particle) => void) | undefined;

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
        this.lifetimeGenerator = toGenerator(args.lifetime ?? 5);
        this.angleGenerator = toGenerator(args.angle ?? 0);
        this.angleSpeedGenerator = toGenerator(args.angleSpeed ?? 0);
        this.gravity = this.gravityGenerator();
        this.breakFactor = args.breakFactor || 1;
        this.blendMode = args.blendMode || "source-over";
        this.alphaCurve = args.alphaCurve || valueCurves.constant;
        this.sizeCurve = args.sizeCurve || valueCurves.constant;
        this.renderingLayer = args.renderingLayer || RenderingLayer.PARTICLES;
        this.zIndex = args.zIndex !== undefined ? args.zIndex : 0;
        this.updateMethod = args.update;

        function toGenerator<tp>(obj: tp | (() => tp)): (() => tp) {
            if (obj instanceof Function) {
                return obj;
            } else {
                return () => obj;
            }
        }
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public clear(): void {
        this.particles = [];
    }

    public emit(count = 1): void {
        for (let i = 0; i < count; i++) {
            this.emitSingle();
        }
    }

    public emitSingle(): Particle {
        const v = this.velocityGenerator();
        const off = this.offsetGenerator();

        const particle = new Particle(
            this,
            this.x + off.x,
            this.y + off.y,
            v.x,
            v.y,
            this.angleGenerator(),
            this.angleSpeedGenerator(),
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

        if (this.updateMethod) {
            for (const p of this.particles) {
                this.updateMethod(p);
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
    private originalLifetime: number;
    private progress: number = 0;

    constructor(
        private emitter: ParticleEmitter,
        public x: number,
        public y: number,
        public vx = 0,
        public vy = 0,
        private angle = 0,
        private angleSpeed = 0,
        private imageOrColor: ParticleAppearance = "white",
        public readonly size = 4,
        private lifetime = 1,
        private alpha = 1
    ) {
        this.halfSize = this.size / 2;
        this.originalLifetime = this.lifetime;
        this.progress = 0;
    }

    public update(dt: number): boolean {
        // Life
        this.lifetime -= dt;

        if (this.lifetime <= 0) {
            // Tell parent that it may eliminate this particle
            return true;
        } else {
            this.progress = 1 - (this.lifetime / this.originalLifetime);
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
        this.angle += this.angleSpeed * dt;

        return false;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.globalAlpha = this.alpha * this.emitter.alphaCurve.get(this.progress);
        ctx.translate(this.x, -this.y);

        if (this.angle) {
            ctx.rotate(this.angle);
        }

        if (this.imageOrColor instanceof Object) {
            // Image
            const img = this.imageOrColor;
            const w = ((<any>img).naturalWidth || img.width), h = ((<any>img).naturalHeight || img.height);
            const sz = Math.max(w, h);
            ctx.drawImage(img, -this.halfSize, -this.halfSize, this.size * w / sz, this.size * h / sz);
        } else {
            // Color
            ctx.fillStyle = this.imageOrColor;
            ctx.fillRect(-this.halfSize, -this.halfSize, this.size, this.size);
        }

        ctx.restore();
    }
}

export class ValueCurve {
    private mapping: number[] = [];

    constructor(private readonly func: (p: number) => number, private readonly steps = 1023) {
        for (let i = 0; i <= steps; i++) {
            this.mapping[i] = func(i / steps);
        }
    }

    public get(p: number): number {
        const i = Math.round(p * this.steps);
        return this.mapping[i < 0 ? 0 : i > this.steps ? this.steps : i];
    }

    public getExact(p: number): number {
        return this.func(p);
    }

    public invert(): ValueCurve {
        return new ValueCurve((p) => this.getExact(1 - p), this.steps);
    }

    public append(otherCurve: ValueCurve, relativeLength = 1): ValueCurve {
        const total = 1 + relativeLength;
        const mid = (total - relativeLength) / total;
        return new ValueCurve((p) => p < mid ? this.getExact(p / mid) :
                otherCurve.getExact((p - mid) / relativeLength),
                Math.max(this.steps, otherCurve.steps));
    }
}

function trapezeFunction(v: number, v1: number = v): ((p: number) => number) {
    return (p: number) => p < v ? p / v : p > 1 - v1 ? (1 - p) / v1 : 1;
}

export const valueCurves = {
    constant: new ValueCurve((p) => 1, 1), // always 1
    linear: new ValueCurve((p) => p), // linear 0 to 1
    trapeze: (v: number = 0.1, v1: number = v) => new ValueCurve(trapezeFunction(v, v1)), // blocky 0 to 1 to 0
    cos: (v: number = 0.1, v1: number = v) => // smooth 0 to 1 to 0
            new ValueCurve((p) => 0.5 - 0.5 * Math.cos(Math.PI * trapezeFunction(v, v1)(p))),
    cubic: new ValueCurve((p) => 3 * p * p - 2 * p * p * p) // smooth 0 to 1
};
