import { PIXEL_PER_METER } from "../../shared/constants";
import { type Aseprite } from "../Aseprite";
import { asset } from "../Assets";
import { entity, type EntityArgs } from "../Entity";
import { type ParticleEmitter, valueCurves } from "../Particles";
import { RenderingLayer } from "../Renderer";
import { rnd, rndInt, timedRnd } from "../util";
import { Environment } from "../World";
import { PhysicsEntity } from "./PhysicsEntity";

/** Cloud entity constructor arguments */
export interface CloudArgs extends EntityArgs {
    /** Set to true to allow the cloud to rain. Defaults to false. */
    canRain?: boolean;
}

@entity("Cloud")
export class Cloud extends PhysicsEntity {
    @asset("sprites/cloud3.aseprite.json")
    private static readonly sprite: Aseprite;

    @asset("images/raindrop.png")
    private static readonly raindrop: HTMLImageElement;

    private readonly rainEmitter: ParticleEmitter;
    private raining = 0;
    private readonly isRainCloud;

    public constructor({ canRain = false, ...args }: CloudArgs) {
        super({ ...args, width: 74, height: 5, reversed: true });
        this.setFloating(true);
        this.isRainCloud = canRain;
        this.rainEmitter = this.scene.particles.createEmitter({
            position: {x: this.x, y: this.y},
            offset: () => ({x: rnd(-1, 1) * 26, y: -rnd(-1, 1) * 5}),
            velocity: () => ({
                x: this.getVelocityX() * PIXEL_PER_METER + rnd(-1, 1) * 5,
                y: -this.getVelocityY() * PIXEL_PER_METER + rnd(50, 80)
            }),
            color: () => Cloud.raindrop,
            size: 4,
            gravity: {x: 0, y: 100},
            lifetime: () => rnd(0.7, 1.2),
            alpha: 0.6,
            alphaCurve: valueCurves.linear.invert()
        });
    }

    public startRain(time: number = Infinity): void {
        this.raining = time;
    }

    public isRaining(): boolean {
        return this.raining > 0;
    }

    public canRain(): boolean {
        return this.isRainCloud;
    }

    public override render(): void {
        this.scene.renderer.addAseprite(
            Cloud.sprite,
            "idle",
            this.x, this.y,
            RenderingLayer.PLATFORMS
        );
    }

    public override update(dt: number): void {
        super.update(dt);

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

    public collidesWith(x: number, y: number): number {
        if (
            x >= this.x - this.width / 2
            && x <= this.x + this.width / 2
            && y >= this.y - this.height
            && y <= this.y
        ) {
            return Environment.PLATFORM;
        }

        return Environment.AIR;
    }
}
