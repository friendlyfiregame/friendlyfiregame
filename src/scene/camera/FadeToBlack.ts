export class FadeToBlack {
    private time: number = 0;
    private source: number = 0;
    private target: number = 0;
    private current: number = 0;
    private duration: number = 0.5;

    private move(target: number, duration = this.duration): this {
        this.time = 0;
        this.source = this.current;
        this.target = target;
        this.duration = duration;
        return this;
    }

    public start(duration?: number): this {
        return this.move(1, duration);
    }

    public stop(duration?: number): this {
        return this.move(0, duration);
    }

    public update(dt: number): void {
        if (this.current !== this.target) {
            const delta = (this.target - this.source) * this.time / this.duration;
            if (this.target > this.source) {
                this.current = Math.min(this.target, this.source + delta);
            } else {
                this.current = Math.max(this.target, this.source + delta);
            }
            this.time += dt;
        }
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
        if (this.current > 0) {
            ctx.save();
            ctx.fillStyle = "black";
            ctx.globalAlpha = this.current;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
            return true;
        }
        return false;
    }
}
