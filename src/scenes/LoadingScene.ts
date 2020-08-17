import { FriendlyFire } from '../FriendlyFire';
import { Scene } from '../Scene';
import { Size } from '../Geometry';
import { TitleScene } from './TitleScene';

export class LoadingScene extends Scene<FriendlyFire> {
    private total = 100;
    private loaded = 50;

    public async activate(): Promise<void> {
        await this.game.assets.load(this.updateProgress.bind(this));
        this.game.scenes.setScene(TitleScene);
    }

    private updateProgress(total: number, loaded: number): void {
        this.total = total;
        this.loaded = loaded;
    }

    public draw(ctx: CanvasRenderingContext2D, size: Size): void {
        if (this.loaded !== this.total) {
            const progressWidth = 200;
            const progressHeight = 8;
            ctx.save();
            ctx.strokeStyle = "#888";
            ctx.fillStyle = "#222";
            ctx.fillRect(((size.width - progressWidth) >> 1), ((size.height - progressHeight) >> 1),
                Math.round(progressWidth * this.loaded / this.total), progressHeight);
            ctx.strokeRect(((size.width - progressWidth) >> 1) + 0.5, ((size.height - progressHeight) >> 1) + 0.5, progressWidth, progressHeight);
            ctx.restore();
        }
    }
}
