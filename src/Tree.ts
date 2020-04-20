import dialog  from '../assets/dialog/tree1.dialog.json';
import { Conversation } from './Conversation';
import { Face, EyeType } from './Face';
import { Game } from "./game";
import { NPC } from './NPC';
import { Sprites, getSpriteIndex } from "./Sprites";
import { TREE_ANIMATION } from "./constants";
import { entity } from "./Entity";
import { loadImage } from "./graphics";

@entity("tree")
export class Tree extends NPC {
    private sprites!: Sprites;
    private spriteIndex = 0;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 26, 54);
        this.face = new Face(this, EyeType.TREE, 1, 5, 94);
        this.startDialog();
    }

    public async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/tree.png"), 2, 1);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        this.sprites.draw(ctx, this.spriteIndex);
        ctx.restore();
        this.drawFace(ctx);
    }

    update(dt: number): void {
        this.spriteIndex = getSpriteIndex(0, TREE_ANIMATION);
    }
    startDialog(): void {
        this.conversation = new Conversation(dialog, this);
    }
}
