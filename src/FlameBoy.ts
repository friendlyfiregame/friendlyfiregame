import { entity } from "./Entity";
import { Game } from "./game";
import { Sprites, getSpriteIndex } from "./Sprites";
import { loadImage } from "./graphics";
import { FLAMEBOY_ANIMATION } from "./constants";
import { ScriptedDialog } from './ScriptedDialog';
import dialogData from "../assets/flameboy.texts.json";
import { NPC } from './NPC';
import { Face, EyeType } from './Face';

@entity("flameboy")
export class FlameBoy extends NPC {
    private sprites!: Sprites;
    private spriteIndex = 0;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 26, 54);
        this.face = new Face(this, EyeType.STANDARD, 1, 0, 21);
    }

    public async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/flameboy.png"), 6, 1);
        this.scriptedDialog = new ScriptedDialog(this, dialogData);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        this.sprites.draw(ctx, this.spriteIndex);
        ctx.restore();
        this.drawDialog(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.spriteIndex = getSpriteIndex(0, FLAMEBOY_ANIMATION);
        this.updateDialog(dt);
    }
}
