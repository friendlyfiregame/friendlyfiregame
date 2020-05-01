
import { Environment } from "./World";
import { EyeType, Face, FaceModes } from './Face';
import { Game, CollidableGameObject } from "./game";
import { NPC } from './NPC';
import { Sound } from './Sound';
import { entity } from "./Entity";
import { now } from "./util";
import { Milestone } from "./Player";
import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";

export enum StoneState {
    DEFAULT = 0,
    SWIMMING = 1,
    FLOATING = 2
}

@entity("stone")
export class Stone extends NPC implements CollidableGameObject {
    @asset("sprites/stone.aseprite.json")
    private static sprite: Aseprite;

    @asset("sounds/throwing/success.mp3")
    private static successSound: Sound;

    public state: StoneState = StoneState.DEFAULT;

    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 26, 54);
        this.direction = -1;
        this.face = new Face(this, EyeType.STONE, 0, 21);
        this.lookAtPlayer = false;
    }

    private showDialoguePrompt (): boolean {
        return (
            this.game.player.getMilestone() >= Milestone.PLANTED_SEED &&
            this.game.player.getMilestone() < Milestone.GOT_STONE
        );
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, -this.y + 1);
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }
        Stone.sprite.drawTag(ctx, "idle", -Stone.sprite.width >> 1, -Stone.sprite.height);
        ctx.restore();
        this.drawFace(ctx, false);
        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);

        if (this.state === StoneState.DEFAULT) {
            if (this.game.world.collidesWith(this.x, this.y - 5) === Environment.WATER) {
                this.game.player.achieveMilestone(Milestone.THROWN_STONE_INTO_WATER);
                this.state = StoneState.SWIMMING;
                this.setVelocity(0, 0);
                this.setFloating(true);
                this.y = 380;
                Stone.successSound.play();
                this.game.campaign.runAction("enable", null, ["flameboy", "flameboy2"]);
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
        this.dialoguePrompt.update(dt, this.x, this.y + 48);
        this.speechBubble.update(this.x, this.y);
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

    public isCarried(): boolean {
        return this.game.player.isCarrying(this);
    }

    public pickUp(): void {
        this.face?.setMode(FaceModes.AMUSED);
        this.game.player.carry(this);
    }
}
