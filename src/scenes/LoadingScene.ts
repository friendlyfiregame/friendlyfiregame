import { FriendlyFire } from "../FriendlyFire";
import { Scene } from "../Scene";
import { ProgressBarNode } from "../scene/ProgressBarNode";
import { TestScene } from "./TestScene";

export class LoadingScene extends Scene<FriendlyFire> {
    private progressBar!: ProgressBarNode;

    public setup(): void {
        this.progressBar = new ProgressBarNode({
            x: this.game.width >> 1,
            y: this.game.height >> 1
        }).appendTo(this.rootNode);
    }

    public cleanup(): void {
        this.rootNode.clear();
    }

    public async activate(): Promise<void> {
        await this.game.assets.load(this.updateProgress.bind(this));
        this.game.scenes.setScene(TestScene);
    }

    private updateProgress(total: number, loaded: number): void {
        if (loaded < total) {
            this.progressBar.setProgress(loaded / total);
        } else {
            this.progressBar.remove();
        }
    }
}
