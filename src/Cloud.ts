import { Game, CollidableGameObject } from "./game";
import { PIXEL_PER_METER } from "./constants";
import { Environment } from "./World";
import { entity } from "./Entity";
import { PhysicsEntity } from "./PhysicsEntity";
import { GameObjectProperties } from "./MapInfo";
import { loadImage } from "./graphics";
import { particles, valueCurves, ParticleEmitter } from './Particles';
import { rnd, timedRnd, rndInt } from './util';
import { Aseprite } from "./Aseprite";

@entity("cloud")
export class Cloud extends PhysicsEntity implements CollidableGameObject {
    private startX: number;
    private startY: number;
    private targetX: number;
    private targetY: number;
    private velocity: number;
    private sprite!: Aseprite;
    private raindrop!: HTMLImageElement;
    private rainEmitter: ParticleEmitter;
    private raining = 0;
    private isRainCloud = false;

    public constructor(game: Game, x: number, y: number, properties: GameObjectProperties, canRain = false) {
        super(game, x, y, 74, 5);
        this.setFloating(true);
        this.startX = this.targetX = x;
        this.startY = this.targetY = y;
        this.isRainCloud = canRain;
        this.velocity = properties.velocity / PIXEL_PER_METER;
        if (properties.direction === "right") {
            this.targetX = x + properties.distance;
            this.setVelocityX(this.velocity);
        } else if (properties.direction === "left") {
            this.targetX = x - properties.distance;
            this.setVelocityX(-this.velocity);
        } else if (properties.direction === "up") {
            this.targetY = y + properties.distance;
            this.setVelocityY(this.velocity);
        } else if (properties.direction === "down") {
            this.targetY = y - properties.distance;
            this.setVelocityY(-this.velocity);
        }
        this.rainEmitter = particles.createEmitter({
            position: {x: this.x, y: this.y},
            offset: () => ({x: rnd(-1, 1) * 26, y: rnd(-1, 1) * 5}),
            velocity: () => ({ x: this.getVelocityX() * PIXEL_PER_METER + rnd(-1, 1) * 5,
                        y: this.getVelocityY() * PIXEL_PER_METER - rnd(50, 80) }),
            color: () => this.raindrop,
            size: 4,
            gravity: {x: 0, y: -100},
            lifetime: () => rnd(0.7, 1.2),
            alpha: 0.6,
            alphaCurve: valueCurves.linear.invert()
        });
    }

    public async load(): Promise<void> {
        this.sprite = await Aseprite.load("assets/sprites/cloud3.aseprite.json");
        this.raindrop = await loadImage("sprites/raindrop.png");
    }

    public startRain(time: number = Infinity) {
        this.raining = time;
    }

    public isRaining(): boolean {
        return this.raining > 0;
    }

    public canRain(): boolean {
        return this.isRainCloud;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y);
        this.sprite.drawTag(ctx, "idle", -this.sprite.width >> 1, -this.sprite.height);
        ctx.restore();
    }

    update(dt: number): void {
        super.update(dt);
        if (this.getVelocityY() > 0) {
            if (this.y >= Math.max(this.startY, this.targetY)) {
                this.y = Math.max(this.startY, this.targetY);
                this.setVelocityY(-this.velocity);
            }
        } else if (this.getVelocityY() < 0) {
            if (this.y <= Math.min(this.startY, this.targetY)) {
                this.y = Math.min(this.startY, this.targetY);
                this.setVelocityY(this.velocity);
            }
        }
        if (this.getVelocityX() > 0) {
            if (this.x >= Math.max(this.targetX, this.startX)) {
                this.x = Math.max(this.targetX, this.startX);
                this.setVelocityX(-this.velocity);
            }
        } else if (this.getVelocityX() < 0) {
            if (this.x <= Math.min(this.startX, this.targetX)) {
                this.x = Math.min(this.startX, this.targetX);
                this.setVelocityX(this.velocity);
            }
        }
        if (this.raining) {
            this.raining -= dt;
            if (this.raining <= 0) {
                this.raining = 0;
            } else {
                if (timedRnd(dt, 0.1)) {
                    this.rainEmitter.setPosition(this.x, this.y);
                    this.rainEmitter.emit(rndInt(1, 4));
                }
            }
        }
    }

    collidesWith(x: number, y: number): number {
        if (x >= this.x - this.width / 2 && x <= this.x + this.width / 2
                && y >= this.y && y <= this.y + this.height) {
            return Environment.PLATFORM;
        }
        return Environment.AIR;
    }
}
