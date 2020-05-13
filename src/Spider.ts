import { NPC } from './NPC';
import { entity } from "./Entity";
import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { Conversation } from './Conversation';
import { GameScene } from "./scenes/GameScene";

interface SpiderSpriteMetadata {
    eyeOffsetFrames?: number[];
}

@entity("spider")
export class Spider extends NPC {

    @asset("sprites/magicspider.aseprite.json")
    private static sprite: Aseprite;

    @asset("sprites/eyes/spider.aseprite.json")
    private static eyes: Aseprite;

    private spriteMetadata: SpiderSpriteMetadata | null = null;
    private eyeOffsetY = 0;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 36, 36);
        Conversation.setGlobal("talkedToSpider", "false");
    }

    public showDialoguePrompt (): boolean {
        return Conversation.getGlobals()["$talkedToSpider"] === "false";
    }

    private getSpriteMetadata(): SpiderSpriteMetadata {
        if (this.spriteMetadata == null) {
            const metadata = Spider.sprite.getLayer("Meta")?.data;
            this.spriteMetadata = metadata ? JSON.parse(metadata) : {};
        }
        return this.spriteMetadata || {};
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.x, -this.y);
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }
        Spider.sprite.drawTag(ctx, 'idle', -Spider.sprite.width >> 1, -Spider.sprite.height, this.scene.gameTime * 1000);
        Spider.eyes.drawTag(ctx, 'blink', (-Spider.eyes.width >> 1) + 5, -Spider.eyes.height - 10 - this.eyeOffsetY,
            this.scene.gameTime * 1000);

        ctx.restore();

        if (this.scene.showBounds) this.drawBounds(ctx);

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt(ctx);
        }
        this.speechBubble.draw(ctx);
    }

    update(dt: number): void {
        super.update(dt);

        // Get y offset to match breathing motion
        const currentFrameIndex = Spider.sprite.getTaggedFrameIndex("idle", this.scene.gameTime * 1000);
        const eyeOffsetFrames = this.getSpriteMetadata().eyeOffsetFrames ?? [];
        this.eyeOffsetY = eyeOffsetFrames.includes(currentFrameIndex + 1) ? 0 : -1;

        this.dialoguePrompt.update(dt, this.x, this.y + 32);
        this.speechBubble.update(this.x, this.y);
    }
}
