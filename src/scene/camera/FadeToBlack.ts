export class FadeToBlack {
    private color: string = "black";
    private time: number = 0;
    private source: number = 0;
    private target: number = 0;
    private current: number = 0;
    private duration: number = 0.5;
    private promise: Promise<this> | null = null;
    private promiseResolve: (() => void) | null = null;

    private move(target: number, duration: number): Promise<this> {
        if (this.promise == null) {
            this.promise = new Promise(resolve => {
                this.promiseResolve = resolve;
            });
        }
        this.time = 0;
        this.source = this.current;
        this.target = target;
        this.duration = duration;
        return this.promise;
    }

    public fadeOut({ duration = 0.8, color = "black" } = {}): Promise<this> {
        this.color = color;
        return this.move(1, duration);
    }

    public fadeIn({ duration = 0.8 } = {}): Promise<this> {
        return this.move(0, duration);
    }

    public set(current: number, color = "black"): this {
        this.color = color;
        this.source = this.target = this.current = current;
        return this;
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
        } else if (this.promiseResolve != null) {
            this.promise = null;
            this.promiseResolve();
            this.promiseResolve = null;
        }
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
        if (this.current > 0) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.current;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }
        return this.current !== this.target;
    }
}
