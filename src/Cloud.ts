import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { CollidableGameObject, GameScene } from './scenes/GameScene';
import { entity } from './Entity';
import { Environment } from './World';
import { GameObjectProperties } from './MapInfo';
import { ParticleEmitter, valueCurves } from './Particles';
import { PhysicsEntity } from './PhysicsEntity';
import { PIXEL_PER_METER } from './constants';
import { Direction, Point, Size } from './Geometry';
import { RenderingLayer } from './Renderer';
import { rnd, rndInt, timedRnd } from './util';

@entity("cloud")
export class Cloud extends PhysicsEntity implements CollidableGameObject {
    @asset("sprites/cloud3.aseprite.json")
    private static sprite: Aseprite;

    @asset("sprites/raindrop.png")
    private static raindrop: HTMLImageElement;

    private start: Point;
    private target: Point;
    private velocity: number;

    private rainEmitter: ParticleEmitter;
    private raining = 0;
    private isRainCloud = false;

    public constructor(scene: GameScene, position: Point, properties: GameObjectProperties, canRain = false) {
        super(scene, position, new Size(74, 5));
        this.setFloating(true);
        this.start = this.target = position;
        this.isRainCloud = canRain;
        this.velocity = properties.velocity / PIXEL_PER_METER;

        if (properties.direction === Direction.RIGHT) {
            this.target.moveXBy(properties.distance);
            this.setVelocityX(this.velocity);
        } else if (properties.direction === Direction.LEFT) {
            this.target.moveXBy(-properties.distance);
            this.setVelocityX(-this.velocity);
        } else if (properties.direction === Direction.UP) {
            this.target.moveYBy(properties.distance);
            this.setVelocityY(this.velocity);
        } else if (properties.direction === Direction.DOWN) {
            this.target.moveYBy(-properties.distance);
            this.setVelocityY(-this.velocity);
        }

        this.rainEmitter = this.scene.particles.createEmitter({
            position: this.position,
            offset: () => new Point(rnd(-1, 1) * 26, rnd(-1, 1) * 5),
            velocity: () => new Point(
                this.getVelocityX() * PIXEL_PER_METER + rnd(-1, 1) * 5,
                this.getVelocityY() * PIXEL_PER_METER - rnd(50, 80)
            ),
            color: () => Cloud.raindrop,
            size: 4,
            gravity: new Point(0, -100),
            lifetime: () => rnd(0.7, 1.2),
            alpha: 0.6,
            alphaCurve: valueCurves.linear.invert()
        });
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
        this.scene.renderer.addAseprite(Cloud.sprite, "idle", this.position, RenderingLayer.PLATFORMS)
    }

    update(dt: number): void {
        super.update(dt);
        if (this.getVelocityY() > 0) {
            if (this.position.y >= Math.max(this.start.y, this.target.y)) {
                this.position.moveYTo(Math.max(this.start.y, this.target.y));
                this.setVelocityY(-this.velocity);
            }
        } else if (this.getVelocityY() < 0) {
            if (this.position.y <= Math.min(this.start.y, this.target.y)) {
                this.position.moveYTo(Math.min(this.start.y, this.target.y));
                this.setVelocityY(this.velocity);
            }
        }
        if (this.getVelocityX() > 0) {
            if (this.position.x >= Math.max(this.target.x, this.start.x)) {
                this.position.moveXTo(Math.max(this.target.x, this.start.x));
                this.setVelocityX(-this.velocity);
            }
        } else if (this.getVelocityX() < 0) {
            if (this.position.x <= Math.min(this.start.x, this.target.x)) {
                this.position.moveXTo(Math.min(this.start.x, this.target.x));
                this.setVelocityX(this.velocity);
            }
        }
        if (this.raining) {
            this.raining -= dt;
            if (this.raining <= 0) {
                this.raining = 0;
            } else {
                if (timedRnd(dt, 0.1)) {
                    this.rainEmitter.setPosition(this.position);
                    this.rainEmitter.emit(rndInt(1, 4));
                }
            }
        }
    }

    collidesWith(position: Point): number {
        if (
            position.x >= this.position.x - this.size.width / 2
            && position.x <= this.position.x + this.size.width / 2
            && position.y >= this.position.y
            && position.y <= this.position.y + this.size.height
        ) {
            return Environment.PLATFORM;
        }

        return Environment.AIR;
    }
}
