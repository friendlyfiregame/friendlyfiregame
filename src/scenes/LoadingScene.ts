import { FriendlyFire } from '../FriendlyFire';
import { Scene } from '../Scene';
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

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        if (this.loaded !== this.total) {
            const progressWidth = 200;
            const progressHeight = 8;
            ctx.save();
            ctx.strokeStyle = "#888";
            ctx.fillStyle = "#222";

            ctx.fillRect(
                ((width - progressWidth) >> 1),
                ((height - progressHeight) >> 1),
                Math.round(progressWidth * this.loaded / this.total),
                progressHeight
            );

            ctx.strokeRect(
                ((width - progressWidth) >> 1) + 0.5,
                ((height - progressHeight) >> 1) + 0.5,
                progressWidth,
                progressHeight
            );

            ctx.restore();
        }
    }
}
