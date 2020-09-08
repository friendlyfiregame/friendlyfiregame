import { Aseprite } from "./Aseprite";
import { asset } from "./Assets";
import { Conversation } from "./Conversation";
import { entity } from "./Entity";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./NPC";
import { RenderingLayer } from "./RenderingLayer";

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

    public constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 36, 36);
        this.setLayer(RenderingLayer.ENTITIES);
        Conversation.setGlobal("talkedToSpider", "false");
    }

    public showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        return Conversation.getGlobals()["$talkedToSpider"] === "false";
    }

    private getSpriteMetadata(): SpiderSpriteMetadata {
        if (this.spriteMetadata == null) {
            const metadata = Spider.sprite.getLayer("Meta")?.data;
            this.spriteMetadata = metadata ? JSON.parse(metadata) : {};
        }

        return this.spriteMetadata || {};
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.scale(this.direction, 1);
        Spider.sprite.drawTag(ctx, "idle", -Spider.sprite.width >> 1, -Spider.sprite.height);

        const totalOffsetY = -10 - this.eyeOffsetY;
        const totalOffsetX = 5;

        Spider.eyes.drawTag(ctx, "blink", -Spider.eyes.width >> 1 + totalOffsetX, -Spider.eyes.height + totalOffsetY);

        ctx.restore();
    }

    public update(dt: number): void {
        super.update(dt);

        // Get y offset to match breathing motion
        const currentFrameIndex = Spider.sprite.getTaggedFrameIndex("idle", this.scene.gameTime * 1000);
        const eyeOffsetFrames = this.getSpriteMetadata().eyeOffsetFrames ?? [];
        this.eyeOffsetY = eyeOffsetFrames.includes(currentFrameIndex + 1) ? 0 : -1;

        this.dialoguePrompt.updatePosition(0, 32);
    }
}
