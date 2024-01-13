import { FriendlyFire } from "../FriendlyFire";
import { Scene } from "../Scene";
import { TitleScene } from "./TitleScene";
import { ProgressBarNode } from "../scene/ProgressBarNode";

export class LoadingScene extends Scene<FriendlyFire> {
    private progressBar!: ProgressBarNode;

    public override setup(): void {
        this.progressBar = new ProgressBarNode({
            x: this.game.width >> 1,
            y: this.game.height >> 1
        }).appendTo(this.rootNode);
    }

    public override cleanup(): void {
        this.rootNode.clear();
    }

    public override async activate(): Promise<void> {
        await this.game.assets.load(this.updateProgress.bind(this));
        this.game.scenes.setScene(TitleScene);
    }

    private updateProgress(total: number, loaded: number): void {
        if (loaded < total) {
            this.progressBar.setProgress(loaded / total);
        } else {
            this.progressBar.remove();
        }
    }
}
