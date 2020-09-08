export class CinematicBars {
    private time: number = 0;
    private source: number = 0;
    private target: number = 0;
    private current: number = 0;
    private duration: number = 0.5;

    private move(target = 0.1, duration = this.duration): this {
        this.time = 0;
        this.source = this.current;
        this.target = target;
        this.duration = duration;
        return this;
    }

    public show({ target, duration }: { target?: number, duration?: number } = {}): this {
        return this.move(target, duration);
    }

    public hide({ duration }: { duration?: number } = {}): this {
        return this.move(0, duration);
    }

    public set(target: number): this {
        this.current = this.source = this.target = target;
        return this;
    }

    public update(dt: number): void {
        if (this.current !== this.target) {
            const delta = (this.target - this.source) * this.time / this.duration;
            if (this.target >= this.source) {
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
            const bar = this.current * height;
            ctx.fillRect(0, 0, width, bar);
            ctx.fillRect(0, height - bar, width, bar);
            ctx.restore();
            return true;
        }
        return false;
    }
}
