import { Bounds } from "./Entity";
import { clamp, isDev, rnd, shiftValue } from "./util";
import { Fire } from "./entities/Fire";
import { GameScene } from "./scenes/GameScene";
import { RenderingLayer, RenderingType } from "./Renderer";
import { ValueCurve, valueCurves } from "./Particles";
import { Vector2Like } from "./graphics/Vector2";

export interface CamFocus {
    x: number;
    y: number;
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
}

interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

type OverBoundData = {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
};

export class Camera {
    public x = 0;
    public y = 0;
    public zoom = 1;
    public rotation = 0;
    private focuses: CamFocus[] = [];
    private time = 0;
    private readonly interpolationTime!: number;
    private zoomingOut = false;
    private currentBarTarget = 0;
    private currentBarHeight = 0;
    private bounds?: Bounds;

    public constructor(
        protected scene: GameScene, private readonly target: Vector2Like, interpolationTime = 0.5,
        private readonly barHeight = 0.1
    ) {
        if (interpolationTime > 1) {
            throw new Error("Camera interpolation time may not exceed 1");
        }

        this.interpolationTime = interpolationTime / 2;

        if (isDev()) {
            console.log("Dev mode, press “Tab” to zoom out & click somewhere to teleport there.");
            document.addEventListener("keydown", this.handleKeyDown.bind(this));
        }

        this.currentBarTarget = 0;
        this.currentBarHeight = 0;
        this.x = target.x;
        this.y = target.y;
    }

    public setBounds(bounds: Bounds | undefined): void {
        this.bounds = bounds;
    }

    public getBounds(): Bounds | undefined {
        return this.bounds;
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (e.key !== "Tab") {
            return;
        }
        const canvas = this.scene.game.canvas;
        const teleport = (e: MouseEvent): void => {
            const rect = canvas.getBoundingClientRect();
            const cx = e.clientX - rect.x, cy = e.clientY - rect.y;
            const px = cx / rect.width, py = cy / rect.height;
            const worldRect = this.getVisibleRect();
            const tx = worldRect.x + px * worldRect.width, ty = worldRect.y + (1 - py) * worldRect.height;

            // Teleport player
            this.scene.player.x = tx;
            this.scene.player.y = ty;
            this.setBounds(this.scene.player.getCurrentMapBounds());

            this.scene.player.setVelocity(0, 0);
            reset();
        };
        const reset = (): void => {
            this.zoomingOut = false;
            document.removeEventListener("keyup", handleKeyUp);
            canvas.removeEventListener("click", teleport);
            document.removeEventListener("keyup", handleKeyUp);
        };
        const handleKeyUp = (e: KeyboardEvent): void => {
            if (e.key === "Tab") {
                reset();
                e.stopPropagation();
                e.preventDefault();
            }
        };
        if (!e.repeat) {
            this.zoomingOut = true;
            document.addEventListener("keyup", handleKeyUp);
            canvas.addEventListener("click", teleport);
        }
        e.stopPropagation();
        e.preventDefault();
    }

    public getVisibleRect(x = this.x, y = this.y): Rectangle {
        const game = this.scene.game;
        const cw = game.width / this.zoom;
        const ch = game.height / this.zoom;
        const offx = cw / 2;
        const offy = ch / 2;

        return {
            x: x - offx,
            y: y - offy,
            width: cw,
            height: ch
        };
    }

    public isPointVisible(x: number, y: number, radius = 0): boolean {
        const visibleRect = this.getVisibleRect();

        return (
            x >= visibleRect.x - radius
            && y >= visibleRect.y - radius
            && x <= visibleRect.x + visibleRect.width + radius
            && y <= visibleRect.y + visibleRect.height + radius
        );
    }

    public setCinematicBar(target: number): void {
        this.currentBarTarget = target;
    }

    private getBaseCameraTarget(): { x: number, y: number } {
        // Base position always on target (player)
        let xTarget = this.target.x;
        let yTarget = this.target.y + 30;

        if (this.bounds) {
            const targetVisibleRect = this.getVisibleRect(xTarget, yTarget);

            const overBounds: OverBoundData = {
                left: (targetVisibleRect.x < this.bounds.x),
                right: (targetVisibleRect.x + targetVisibleRect.width) > (this.bounds.x + this.bounds.width),
                top: (targetVisibleRect.y + targetVisibleRect.height) > this.bounds.y,
                bottom: targetVisibleRect.y < (this.bounds.y - this.bounds.height)
            };

            // Bound clip left / right
            if (targetVisibleRect.width >= this.bounds.width) {
                const visibleCenterX = targetVisibleRect.x + targetVisibleRect.width / 2;
                const boundCenterX = this.bounds.x + this.bounds.width / 2;
                const diff = boundCenterX - visibleCenterX;
                xTarget += diff;
            } else if (overBounds.left) {
                const diff = this.bounds.x - targetVisibleRect.x;
                xTarget += diff;
            } else if (overBounds.right) {
                const diff = (this.bounds.x + this.bounds.width) - (targetVisibleRect.x + targetVisibleRect.width);
                xTarget += diff;
            }

            // Bound clip top / bottom
            if (targetVisibleRect.height >= this.bounds.height) {
                const visibleCenterY = (targetVisibleRect.y + targetVisibleRect.height) - targetVisibleRect.height / 2;
                const boundCenterY = this.bounds.y - this.bounds.height / 2;
                const diff = boundCenterY - visibleCenterY;
                yTarget += diff;
            } else if (overBounds.top) {
                const diff = this.bounds.y - (targetVisibleRect.y + targetVisibleRect.height);
                yTarget += diff;
            } else if (overBounds.bottom) {
                const diff = (this.bounds.y - this.bounds.height) - targetVisibleRect.y;
                yTarget += diff;
            }
        }

        return {
            x: xTarget,
            y: yTarget
        };
    }

    public update(dt: number, time: number): void {
        this.time = time;

        // Base position always on target (player)
        const baseCamTarget = this.getBaseCameraTarget();
        this.x = baseCamTarget.x;
        this.y = baseCamTarget.y;

        // Cam Shake during apocalypse
        if (this.scene.fire.isAngry() || this.scene.apocalypse) {
            this.applyApocalypticShake(this.scene.fire);
        }

        this.zoom = 1;
        this.rotation = 0;
        if (this.zoomingOut) {
            const game = this.scene.game;
            const cw = game.width;
            const ch = game.height;
            const world = this.scene.world;
            const w = world.getWidth();
            const h = world.getHeight();
            this.x = w / 2;
            this.y = h / 2;
            this.zoom = Math.min(cw / w, ch / h);
        }

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

    private applyApocalypticShake(shakeSource: Fire): void {
        const dx = this.x - shakeSource.x, dy = this.y - shakeSource.y;
        const dis = Math.sqrt(dx * dx + dy * dy);
        const maxDis = 200;

        if (dis < maxDis) {
            const intensity = (shakeSource.intensity - 5) / 15;

            if (intensity > 0) {
                const shake = 5 * intensity * (1 - dis / maxDis) * (this.scene.player.playerConversation ? 0.5 : 1);
                this.x += rnd(-1, 1) * shake;
                this.y += rnd(-1, 1) * shake;
            }
        }
    }

    /**
     * Returns true if cam target (player) currently has full attention, or is showing something else for the moment.
     */
    public isOnTarget(): boolean {
        return this.focuses.length === 0;
    }

    /**
     * Returns strength of camera focus on something other than the player. E.g. when camera focuses on some place to
     * show the player, the focus force will be between 0 and 1 during interpolation and exactly 1 while fully focusing
     * on that spot. This e.g. can be used for cinematic bars at top and bottom, scaling their height.
     */
    public getFocusForce(): number {
        return this.focuses.reduce((a, b) => Math.max(a, b.force), 0);
    }

    public applyTransform(ctx: CanvasRenderingContext2D): void {
        ctx.scale(this.zoom, this.zoom);
        ctx.rotate(this.rotation);
        ctx.translate(-this.x, this.y);
        if (this.zoomingOut) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
        }
    }

    public unapplyTransform(ctx: CanvasRenderingContext2D): void {
        ctx.translate(this.x, -this.y);
        ctx.rotate(-this.rotation);
        ctx.scale(1 / this.zoom, 1 / this.zoom);
    }

    public focusOn(
        duration: number, x: number, y: number, zoom = 1, rotation = 0,
        curve = valueCurves.cos(this.interpolationTime)
    ): Promise<void> {
        const focus: CamFocus = {
            x,
            y,
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

    public updateAndApplyFocus(focus: CamFocus): void {
        focus.progress = clamp((this.time - focus.startTime) / focus.duration, 0, 1);
        focus.dead = (focus.progress >= 1);

        if (!focus.dead) {
            // Fade in and out of focus using force lerping from 0 to 1 and back to 0 over time
            const force = focus.force = focus.curve.get(focus.progress);

            // Apply to camera state
            const f1 = 1 - force;
            this.x = f1 * this.x + force * focus.x;
            this.y = f1 * this.y + force * focus.y;
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
        });
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

    public isZoomingOut(): boolean {
        return this.zoomingOut;
    }
}
