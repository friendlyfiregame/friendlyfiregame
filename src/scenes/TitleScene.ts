import { Scene } from "../Scene";
import { FriendlyFire } from "../FriendlyFire";
import { asset } from "../Assets";
import { FadeTransition } from "../transitions/FadeTransition";
import { CurtainTransition } from "../transitions/CurtainTransition";
import { easeInSine } from "../easings";
import { BitmapFont } from "../BitmapFont";
import { GameScene } from "./GameScene";

const credits = "Friendly Fire is a contribution to Ludum Dare Game Jam Contest #46. " +
    "Created by Eduard But, Nico Huelscher, Benjamin Jung, Nils Kreutzer, Bastian Lang, Ranjit Mevius, Markus Over, " +
    "Klaus Reimer and Jennifer van Veen, within 72 hours.";

export class TitleScene extends Scene<FriendlyFire> {
    @asset("images/title.png")
    private static titleImage: HTMLImageElement;

    @asset("fonts/standard.font.json")
    private static font: BitmapFont;

    private time: number = 0;

    public setup(): void {
        this.inTransition = new FadeTransition();
        this.outTransition = new CurtainTransition({ easing: easeInSine });
    }

    public activate(): void {
        this.keyboard.onKeyDown.connect(this.handleKeyDown, this);

        // Start music after pressing a key or mouse button because Chrome doesn't want to autostart music
        const startMusic = async () => {
            try {
                await this.playMusicTrack();
                document.removeEventListener("keydown", startMusic);
                document.removeEventListener("mousedown", startMusic);
            } catch (e) {
                document.addEventListener("keydown", startMusic);
                document.addEventListener("mousedown", startMusic);
            }
        }
        startMusic();
    }

    public deactivate(): void {
        this.keyboard.onKeyDown.disconnect(this.handleKeyDown, this);
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (event.code === "Enter") {
            this.game.scenes.setScene(GameScene);
        }
    }

    public update(dt: number) {
        this.time += dt;
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();
        ctx.beginPath();
        ctx.drawImage(TitleScene.titleImage, 0, 0);
        const off = (this.time * 1000 / 12) % 2000;
        const cx = Math.round(width + 100 - off);
        TitleScene.font.drawText(ctx, "Press Enter", 75, 160, "white", 0);
        TitleScene.font.drawText(ctx, credits, cx, ctx.canvas.height - 20, "white", 0);
        ctx.restore();
    }

    private async playMusicTrack(): Promise<void> {
        const music = FriendlyFire.music[0];
        FriendlyFire.music.forEach(music => music.stop());
        music.setLoop(true);
        music.setVolume(0.25);
        FriendlyFire.music[1].setVolume(0.25);
        return music.play();
    }
}
