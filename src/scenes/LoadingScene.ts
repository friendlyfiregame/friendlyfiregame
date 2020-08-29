import { FriendlyFire } from '../FriendlyFire';
import { Scene } from '../Scene';
import { Size } from '../geometry/Size';
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
            const progressBarSize = new Size(200, 8);

            ctx.save();
            ctx.strokeStyle = "#888";
            ctx.fillStyle = "#222";

            ctx.fillRect(
                (size.width - progressBarSize.width) >> 1,
                (size.height - progressBarSize.height) >> 1,
                Math.round(progressBarSize.width * this.loaded / this.total),
                progressBarSize.height
            );

            ctx.strokeRect(
                ((size.width - progressBarSize.width) >> 1) + 0.5,
                ((size.height - progressBarSize.height) >> 1) + 0.5,
                progressBarSize.width,
                progressBarSize.height
            );

            ctx.restore();
        }
    }
}
