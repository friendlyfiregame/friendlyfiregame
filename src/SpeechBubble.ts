import { Subject } from "rxjs"
import { Entity } from './Entity';
import { Game } from "./game";
import { Message } from "./Dialog";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): CanvasRenderingContext2D {
    if (w < 2 * r) {r = w / 2};
    if (h < 2 * r) {r = h / 2};
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    return ctx;
  }

export class SpeechBubble extends Entity {
    public fontSize = 10;
    public lineHeight = 15;
    public height = this.message.split("\n").length * this.lineHeight;
    public onActionPathTaken = new Subject<Array<Message>>();
    private selectionIndex = 0;

    constructor(
        game: Game,
        x: number,
        y: number,
        private color = "#FFBBBB",
        public interactive = true,
        public message = "Hey Block,\ndo you have 1 nicen Auftrag for me?",
        public actionPaths: Map<string, Array<Message>> | null = null
    ) {
        super(game, x, y);
        if (this.actionPaths) {
            document.addEventListener("keyup", event => this.handleKeyUp(event));
        }
    }

    private handleKeyUp(event: KeyboardEvent) {
        if (event.key === "ArrowRight") {
            this.changeSelectionIndex(true);
        } else if (event.key === "ArrowLeft") {
            this.changeSelectionIndex(false);
        } else if (event.key === "Escape") {
            this.game.player.isInDialog = false;
            this.game.player.activeSpeechBubble = null;
        } else if (event.key === "Enter" && this.actionPaths && this.actionPaths.size > 0) {
            this.onActionPathTaken.next(Array.from(this.actionPaths.values())[this.selectionIndex]);
        }
    }

    draw(ctx: CanvasRenderingContext2D, x?: number, y?: number): void {
        const height = (!!(this.actionPaths?.size) ? this.lineHeight : 0) + this.height
        x = x ?? this.x;
        y = (y ?? this.y) + 10;
        ctx.save();
        ctx.beginPath();
        ctx.font = this.fontSize + "px Arial";
        const calculatedWidth = ctx.measureText(this.message.split("\n").sort((a, b) => b.length - a.length)[0]).width;
        ctx = roundRect(ctx, x - calculatedWidth / 2, - y - height, calculatedWidth + 8, height, 5);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.fillStyle = "black";
        const lines = this.message.split('\n');

        for (let i = 0; i<lines.length; i++) {
            ctx.fillText(lines[i], x - calculatedWidth / 2 + 4, -y - height + 10 + (i * this.lineHeight), 200 - 8);
        }
        if (this.actionPaths) {
            let positionFromRightBorder = 0;
            let index = this.actionPaths.size - 1;
            Array.from(this.actionPaths.keys()).forEach(actionKey => {
                const actionWidth = ctx.measureText(actionKey).width;
                positionFromRightBorder += actionWidth + 8;
                ctx.fillText(
                    actionKey,
                    (x ?? this.x) + calculatedWidth / 2 - positionFromRightBorder - 4,
                    - (y ?? this.y) - height + 10 + (lines.length + 1 * this.lineHeight),
                    200 - 8
                );
                if (this.selectionIndex === index) {
                    ctx.restore();
                    ctx.save();
                    ctx.beginPath();
                    ctx.fillStyle = "black";
                    ctx.rect((x ?? this.x) + calculatedWidth / 2 - positionFromRightBorder - 8,
                        - (y ?? this.y) - height + 4 + (lines.length + 1 * this.lineHeight), 4, 4);
                        ctx.fill();
                }
                index--;
            })
        }
        ctx.restore();
    }

    update(dt: number): void {
        // this.x += 60 * dt / 1000;
    }

    getBoundingClientRect(): { width: number, height: number, left: number, top: number, right: number, bottom: number } {
        return {
            width: this.width,
            height: this.height,
            left: this.x - this.width / 2,
            top: this.y - this.height / 2,
            right: this.x + this.width / 2,
            bottom: this.y + this.height / 2
        }
    }

    changeSelectionIndex(increase: boolean): void {
        if (this.actionPaths && this.actionPaths.size > 0) {
            if (increase) {
                this.selectionIndex = (this.selectionIndex + 1) % this.actionPaths.size;
            } else {
                if (this.selectionIndex - 1 === -1) {
                    this.selectionIndex = this.actionPaths.size - 1;
                } else {
                    this.selectionIndex--;
                }
            }
        }
    }
}
