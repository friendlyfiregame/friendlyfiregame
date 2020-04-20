import { entity } from "./Entity";
import { Game, CollidableGameObject } from "./game";
import { Sprites, getSpriteIndex } from "./Sprites";
import { loadImage } from "./graphics";
import { STONE_ANIMATION } from "./constants";
import { NPC } from './NPC';
import { EyeType, Face } from './Face';
import { ScriptedDialog } from './ScriptedDialog';
import dialogData from "../assets/stone.texts.json";
import { Environment } from "./World";
import { now } from "./util";
import { Sound } from './Sound';

export enum StoneState {
    DEFAULT = 0,
    SWIMMING = 1,
    FLOATING = 2
}

@entity("stone")
export class Stone extends NPC implements CollidableGameObject {
    private sprites!: Sprites;
    private spriteIndex = 0;
    public direction = -1;
    public state: StoneState = StoneState.DEFAULT;
    private successSound!: Sound;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 26, 54);
        this.face = new Face(this, EyeType.STONE, 1, 0, 21);
    }

    public async load(): Promise<void> {
        this.sprites = new Sprites(await loadImage("sprites/stone.png"), 3, 1);
        this.scriptedDialog = new ScriptedDialog(this.game, this, dialogData);
        this.successSound = new Sound("sounds/throwing/success.mp3");
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        if (this.direction === 1) {
            ctx.scale(-1, 1);
        }
        this.sprites.draw(ctx, this.spriteIndex);
        ctx.restore();
        this.face?.draw(ctx);
        this.drawDialog(ctx);
    }

    update(dt: number): void {
        super.update(dt);
        this.spriteIndex = getSpriteIndex(0, STONE_ANIMATION);
        this.updateDialog(dt);

        if (this.state === StoneState.DEFAULT) {
            if (this.game.world.collidesWith(this.x, this.y - 5) === Environment.WATER) {
                this.state = StoneState.SWIMMING;
                this.setVelocity(0, 0);
                this.setFloating(true);
                this.y = 380;
                this.successSound.play();
            }
        } else if (this.state === StoneState.SWIMMING) {
            const diffX = 900 - this.x;
            this.direction = Math.sign(diffX);
            const moveX = Math.min(20, Math.abs(diffX)) * Math.sign(diffX);
            this.x += moveX * dt;
            if (Math.abs(moveX) < 2) {
                this.state = StoneState.FLOATING;
            }
            this.setVelocityY(Math.abs(((now() % 2000) - 1000) / 1000) - 0.5);
        } else if (this.state === StoneState.FLOATING) {
            this.x = 900;
            this.direction = -1;
            this.setVelocityY(Math.abs(((now() % 2000) - 1000) / 1000) - 0.5);
        }
    }

    collidesWith(x: number, y: number): number {
        if (this.state === StoneState.FLOATING || this.state === StoneState.SWIMMING) {
            if (x >= this.x - this.width / 2 && x <= this.x + this.width / 2
                    && y >= this.y && y <= this.y + this.height) {
                return Environment.PLATFORM;
            }
        }
        return Environment.AIR;
    }
}
