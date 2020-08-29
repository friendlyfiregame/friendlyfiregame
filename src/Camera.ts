import { Bounds } from './Entity';
import { clamp, isDev, rnd, shiftValue } from './util';
import { Fire } from './Fire';
import { GameScene } from './scenes/GameScene';
import { Point } from './geometry/Point';
import { RenderingLayer, RenderingType } from './Renderer';
import { Size } from './geometry/Size';
import { ValueCurve, valueCurves } from './Particles';

export interface camFocus {
    position: Point;
    duration: number;
    startTime: number;
    endTime: number;
    zoom: number;
    rotation: number;
    progress: number;
    dead: boolean;
    force: number;
    curve: ValueCurve;
    resolve?: Function;
};

interface Rectangle {
    position: Point;
    size: Size;
};

type OverBoundData = {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
}

export class Camera {
    public position = Point.getOrigin();
    public zoom = 1;
    public rotation = 0;
    private focuses: camFocus[] = [];
    private time = 0;
    private interpolationTime!: number;
    private zoomingOut = false;
    private currentBarTarget = 0;
    private currentBarHeight = 0;
    private bounds?: Bounds;

    constructor(
        protected scene: GameScene, private target: Point, interpolationTime = 0.5,
        private barHeight = 0.1
    ) {
        if (interpolationTime > 1) {
            throw new Error("Camera interpolation time may not exceed 1");
        }

        this.interpolationTime = interpolationTime / 2;

        if (isDev()) {
            console.log("Dev mode, press “Tab” to zoom out & click somewhere to teleport there.");
            document.addEventListener("keydown", this.handleKeyDown.bind(this));
            document.addEventListener("keyup", this.handleKeyUp.bind(this));
            this.scene.game.canvas.addEventListener("click", this.handleClick.bind(this));
        }

        this.currentBarTarget = 0;
        this.currentBarHeight = 0;
    }

    public setBounds (bounds: Bounds | undefined) {
        this.bounds = bounds;
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Tab") {
            if (!e.repeat) {
                this.zoomingOut = true;
            }

            e.stopPropagation();
            e.preventDefault();
        }
    }

    private handleKeyUp(e: KeyboardEvent) {
        if (e.key === 'Tab') {
            this.zoomingOut = false;
            e.stopPropagation();
            e.preventDefault();
        }
    }

    private handleClick(e: MouseEvent) {
        if (this.zoomingOut) {
            const rect = this.scene.game.canvas.getBoundingClientRect();
            const cx = e.clientX - rect.x;
            const cy = e.clientY - rect.y;
            const px = cx / rect.width;
            const py = cy / rect.height;
            const worldRect = this.getVisibleRect();

            // Teleport player
            this.scene.player.position.moveTo(
                worldRect.position.x + px * worldRect.size.width,
                worldRect.position.y + (1 - py) * worldRect.size.height
            );

            this.scene.player.setVelocity(0, 0);
            this.zoomingOut = false;
        }
    }

    public getVisibleRect(position = this.position): Rectangle {
        const canvas = this.scene.game.canvas;
        const offset = new Point(canvas.width / 2 / this.zoom, canvas.height / 2 / this.zoom);

        return {
            position: position.clone().moveBy(-offset.x, -offset.y),
            size: new Size(offset.x * 2, offset.y * 2)
        };
    }

    public isPointVisible(position: Point, radius = 0): boolean {
        const visibleRect = this.getVisibleRect();

        return (
            position.x >= visibleRect.position.x - radius
            && position.y >= visibleRect.position.y - radius
            && position.x <= visibleRect.position.x + visibleRect.size.width + radius
            && position.y <= visibleRect.position.y + visibleRect.size.height + radius
        )
    }

    public setCinematicBar(target: number) {
        this.currentBarTarget = target;
    }

    private getBaseCameraTarget(): Point {
        // Base position always on target (player)
        let target = this.target.clone().moveYBy(30);

        if (this.bounds) {
            const targetVisibleRect = this.getVisibleRect(target);

            const overBounds: OverBoundData = {
                left: (targetVisibleRect.position.x < this.bounds.position.x),
                right: (targetVisibleRect.position.x + targetVisibleRect.size.width) > (this.bounds.position.x + this.bounds.size.width),
                top: (targetVisibleRect.position.y + targetVisibleRect.size.height) > this.bounds.position.y,
                bottom: targetVisibleRect.position.y < (this.bounds.position.y - this.bounds.size.height)
            }

            // Bound clip left / right
            if (targetVisibleRect.size.width >= this.bounds.size.width) {
                const visibleCenterX = targetVisibleRect.position.x + targetVisibleRect.size.width / 2;
                const boundCenterX = this.bounds.position.x + this.bounds.size.width / 2;
                const diff = boundCenterX - visibleCenterX;
                target.moveXBy(diff);
            } else if (overBounds.left) {
                const diff = this.bounds.position.x - targetVisibleRect.position.x;
                target.moveXBy(diff);
            } else if (overBounds.right) {
                const diff = (this.bounds.position.x + this.bounds.size.width) - (targetVisibleRect.position.x + targetVisibleRect.size.width);
                target.moveXBy(diff);
            }

            // Bound clip top / bottom
            if (targetVisibleRect.size.height >= this.bounds.size.height) {
                const visibleCenterY = (targetVisibleRect.position.y + targetVisibleRect.size.height) - targetVisibleRect.size.height / 2;
                const boundCenterY = this.bounds.position.y - this.bounds.size.height / 2;
                const diff = boundCenterY - visibleCenterY;
                target.moveYBy(diff);
            } else if (overBounds.top) {
                const diff = this.bounds.position.y - (targetVisibleRect.position.y + targetVisibleRect.size.height);
                target.moveYBy(diff);
            } else if (overBounds.bottom) {
                const diff = (this.bounds.position.y - this.bounds.size.height) - targetVisibleRect.position.y;
                target.moveYBy(diff);
            }
        }

        return target;
    }

    public update(dt: number, time: number): void {
        this.time = time;

        // Base position always on target (player)
        const baseCamTarget = this.getBaseCameraTarget();
        this.position.moveTo(baseCamTarget)

        // Cam Shake during apocalypse
        if (this.scene.fire.isAngry() || this.scene.apocalypse) {
            this.applyApocalypticShake(this.scene.fire);
        }

        this.zoom = this.zoomingOut ? 0.2 : 1;
        this.rotation = 0;

        // On top of that, apply cam focus(es)
        for (const focus of this.focuses) {
            this.updateAndApplyFocus(focus);
        }

        // Drop any focus that is done
        this.focuses = this.focuses.filter(f => !f.dead);
        // Update bar target towards goal
        this.currentBarHeight = shiftValue(this.currentBarHeight, this.currentBarTarget, dt * 1.5);
        // Reset bar to vanish automatically if not continuously set to 1
        this.currentBarTarget = 0;
    }

    private applyApocalypticShake(shakeSource: Fire) {
        const dx = this.position.x - shakeSource.position.x;
        const dy = this.position.y - shakeSource.position.y;
        const dis = Math.sqrt(dx * dx + dy * dy);
        const maxDis = 200;

        if (dis < maxDis) {
            const intensity = (shakeSource.intensity - 5) / 15;

            if (intensity > 0) {
                const shake = 5 * intensity * (1 - dis / maxDis) * (this.scene.player.playerConversation ? 0.5 : 1);
                this.position.moveBy(rnd(-1, 1) * shake, rnd(-1, 1) * shake)
            }
        }
    }

    /**
     * Returns true if cam target (player) currently has full attention, or is showing something
     * else for the moment.
     */
    public isOnTarget(): boolean {
        return this.focuses.length === 0;
    }

    /**
     * Returns strength of camera focus on something other than the player. E.g. when camera focuses
     * on some place to show the player, the focus force will be between 0 and 1 during
     * interpolation and exactly 1 while fully focusing on that spot. This e.g. can be used for
     * cinematic bars at top and bottom, scaling their height.
     */
    public getFocusForce(): number {
        return this.focuses.reduce((a, b) => Math.max(a, b.force), 0);
    }

    public applyTransform(ctx: CanvasRenderingContext2D): void {
        ctx.scale(this.zoom, this.zoom);
        ctx.rotate(this.rotation);
        ctx.translate(-this.position.x, this.position.y);
    }

    public focusOn(
        duration: number, position: Point, zoom = 1, rotation = 0,
        curve = valueCurves.cos(this.interpolationTime)
    ): Promise<void> {
        const focus: camFocus = {
            position,
            duration,
            zoom,
            rotation,
            startTime: this.time,
            endTime: this.time + duration,
            progress: 0,
            dead: false,
            force: 0,
            curve
        };

        this.focuses.push(focus);

        return new Promise((resolve, reject) => {
            focus.resolve = resolve;
            this.updateAndApplyFocus(focus);
        });
    }

    public updateAndApplyFocus(focus: camFocus): void {
        focus.progress = clamp((this.time - focus.startTime) / focus.duration, 0, 1);
        focus.dead = (focus.progress >= 1);

        if (!focus.dead) {
            // Fade in and out of focus using force lerping from 0 to 1 and back to 0 over time
            const force = focus.force = focus.curve.get(focus.progress);

            // Apply to camera state
            const f1 = 1 - force;

            this.position.moveTo(
                f1 * this.position.x + force * focus.position.x,
                f1 * this.position.y + force * focus.position.y
            );

            const originalSize = 1 / this.zoom, targetSize = 1 / focus.zoom;
            const currentSize = f1 * originalSize + force * targetSize;

            this.zoom = 1 / currentSize;
            this.rotation = f1 * this.rotation + force * focus.rotation;
        } else {
            if (focus.resolve) {
                focus.resolve();
                focus.resolve = undefined;
            }
        }
    }

    public addCinematicBarsToRenderer(force = this.getFocusForce()): void {
        force = Math.max(force, this.getFocusForce(), this.currentBarHeight);

        this.scene.renderer.add({
            type: RenderingType.BLACK_BARS,
            layer: RenderingLayer.BLACK_BARS,
            color: "black",
            height: this.barHeight,
            force
        })
    }

    public drawBars(ctx: CanvasRenderingContext2D, force = this.getFocusForce()): void {
        force = Math.max(force, this.getFocusForce(), this.currentBarHeight);
        ctx.save();
        ctx.fillStyle = "black";
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const f = 0.5 - 0.5 * Math.cos(Math.PI * force);
        const h = ctx.canvas.height * this.barHeight * f;
        ctx.fillRect(0, 0, ctx.canvas.width, h);
        ctx.fillRect(0, ctx.canvas.height - h, ctx.canvas.width, h);
        ctx.restore();
    }
}
